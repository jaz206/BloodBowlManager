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
  setAndStoreGoogleClientId: (id: string) => void;
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

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // 1. Load user from storage
    try {
      const savedUser = localStorage.getItem('bloodbowl-user');
      if (savedUser && isMounted) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
        console.error("Could not parse saved user", error);
        localStorage.removeItem('bloodbowl-user');
    }

    // 2. Determine Client ID (localStorage > meta tag)
    const storedClientId = localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
    if (storedClientId) {
      setGoogleClientId(storedClientId);
    } else {
      const clientIdMeta = document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]');
      const metaClientId = clientIdMeta ? clientIdMeta.content : null;
      if (metaClientId) {
        setGoogleClientId(metaClientId);
      }
    }

    // 3. Initialize GSI if Client ID is present
    const initializeGsi = () => {
      if (!isMounted) return;

      if (!googleClientId) {
        console.warn("Google Sign-In disabled: client_id not configured.");
        setIsGsiInitialized(false);
        setIsLoading(false);
        return;
      }

      if (window.google && window.google.accounts) {
        try {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleCredentialResponse,
              use_fedcm_for_prompt: false,
            });
            setIsGsiInitialized(true);
        } catch(e) {
            console.error("Error initializing GSI:", e);
            setIsGsiInitialized(false);
        }
      } else {
        console.error("Google Identity Services script not loaded.");
        setIsGsiInitialized(false);
      }
      setIsLoading(false);
    };
    
    // The GSI script is loaded asynchronously, so we need to wait for it.
    const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (script) {
        // If the script is already loaded, window.google will exist.
        if (window.google) {
            initializeGsi();
        } else {
            script.onload = initializeGsi;
            script.onerror = () => {
                console.error("Failed to load Google GSI script.");
                if (isMounted) {
                    setIsGsiInitialized(false);
                    setIsLoading(false);
                }
            };
        }
    } else {
        console.error("Google GSI script tag not found.");
        if (isMounted) {
            setIsGsiInitialized(false);
            setIsLoading(false);
        }
    }
    
    return () => { isMounted = false; };
  }, [googleClientId]); // Re-run effect if client ID changes

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
    // Prevent Google's One Tap prompt on next visit
    if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('bloodbowl-user');
    setUser(null);
  };

  const setAndStoreGoogleClientId = (id: string) => {
    localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, id);
    setGoogleClientId(id);
    // Reload to ensure GSI script initializes with the new ID correctly.
    window.location.reload();
  };

  const value = { user, login, logout, loginAsGuest, isLoading, isGsiInitialized, setAndStoreGoogleClientId };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
