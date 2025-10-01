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
  isLoading: boolean;
  isGsiInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT
// This is a simplified version and doesn't validate the signature.
// For production apps, validation should happen on a server.
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGsiInitialized, setIsGsiInitialized] = useState(false);

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

    // 2. Initialize GSI
    const initializeGsi = () => {
      if (!isMounted) return;

      const clientIdMeta = document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]');
      const clientId = clientIdMeta ? clientIdMeta.content : null;
      
      if (!clientId || clientId.includes('YOUR_CLIENT_ID')) {
        console.warn("Google Sign-In disabled: client_id not configured in index.html.");
        setIsGsiInitialized(false);
        setIsLoading(false);
        return;
      }

      if (window.google && window.google.accounts) {
        try {
            window.google.accounts.id.initialize({
              client_id: clientId,
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
    if (window.google) {
        initializeGsi();
    } else {
        const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
        if (script) {
            script.onload = initializeGsi;
            script.onerror = () => {
                console.error("Failed to load Google GSI script.");
                if (isMounted) {
                    setIsGsiInitialized(false);
                    setIsLoading(false);
                }
            };
        } else {
            console.error("Google GSI script tag not found.");
             if (isMounted) {
                setIsGsiInitialized(false);
                setIsLoading(false);
            }
        }
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

  const logout = () => {
    // Prevent Google's One Tap prompt on next visit
    if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('bloodbowl-user');
    setUser(null);
  };

  const value = { user, login, logout, isLoading, isGsiInitialized };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};