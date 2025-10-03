import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

// Extend the Window interface to include the google object from the GSI script
declare global {
  interface Window {
    google: any;
  }
}

interface AuthContextType {
  user: User | null;
  login: (credential: string) => void;
  logout: () => void;
  loginAsGuest: () => void;
  isLoading: boolean;
  isGsiInitialized: boolean;
  gsiError: string | null;
  setAndStoreGoogleClientId: (id: string) => void;
  googleClientId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

const GOOGLE_CLIENT_ID_STORAGE_KEY = 'google-client-id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGsiInitialized, setIsGsiInitialized] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [gsiError, setGsiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Load user from storage
    try {
      const savedUser = localStorage.getItem('bloodbowl-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
        console.error("Could not parse saved user", error);
        localStorage.removeItem('bloodbowl-user');
    }

    const finalClientId = localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY) || document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]')?.content || null;
    setGoogleClientId(finalClientId);

    if (!finalClientId) {
      console.warn("Google Sign-In disabled: client_id not configured.");
      if (isMounted) {
        setIsGsiInitialized(false);
        setIsLoading(false);
      }
      return;
    }

    const script = document.getElementById('gsi-client-script') as HTMLScriptElement | null;
    if (!script) {
        if (isMounted) {
            setGsiError("Error crítico: No se encontró la etiqueta del script de Google GSI.");
            setIsLoading(false);
        }
        return;
    }

    const initializeGsi = () => {
        if (!isMounted) return;

        if (!window.google?.accounts?.id) {
            setGsiError("La librería de Google Identity Services no se cargó correctamente.");
            setIsLoading(false);
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: finalClientId,
                callback: handleCredentialResponse,
                error_callback: (error: any) => {
                  console.error("GSI Error Callback:", error);
                  if (error?.type === 'popup_closed') return; // Ignore user closing the popup
                  setGsiError(`Error de Google Sign-In: ${error.type || 'desconocido'}. Consulta la consola para más detalles.`);
                }
            });
            setIsGsiInitialized(true);
        } catch (e: any) {
            console.error("Error initializing GSI:", e);
            setGsiError(`Error al inicializar GSI: ${e.message || 'Error desconocido'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (window.google) {
        initializeGsi();
    } else {
        script.onload = initializeGsi;
        script.onerror = () => {
            if (isMounted) {
                setGsiError("No se pudo cargar el script de inicio de sesión de Google.");
                setIsLoading(false);
            }
        };
    }
    
    return () => { isMounted = false; };
  }, []);

  const handleCredentialResponse = (response: any) => {
    login(response.credential);
  };
  
  const login = (credential: string) => {
    const decodedToken = decodeJwt(credential);
    if (decodedToken) {
      const newUser: User = {
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
      };
      localStorage.setItem('bloodbowl-user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
        id: `guest-${Date.now()}`,
        name: 'Invitado',
        email: '',
        picture: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'%3E%3Cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /%3E%3C/svg%3E%0A`,
    };
    localStorage.setItem('bloodbowl-user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = () => {
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('bloodbowl-user');
    setUser(null);
  };

  const setAndStoreGoogleClientId = (id: string) => {
    localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, id);
    window.location.reload();
  };

  const value = { user, login, logout, loginAsGuest, isLoading, isGsiInitialized, gsiError, setAndStoreGoogleClientId, googleClientId };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};