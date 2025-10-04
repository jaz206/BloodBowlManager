
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { auth } from '../App';
import { GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  loginAsGuest: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If auth is not initialized (due to config error), don't set up the listener.
    if (!auth) {
        // Still check for a local guest session
        const savedUserJson = localStorage.getItem('bloodbowl-user');
        if (savedUserJson) {
            try {
                const savedUser = JSON.parse(savedUserJson);
                if (savedUser.id && savedUser.id.startsWith('guest-')) {
                    setUser(savedUser);
                }
            } catch {
                // Ignore parsing errors and stay logged out.
                localStorage.removeItem('bloodbowl-user');
            }
        }
        setIsLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in via Firebase. This is our source of truth.
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Entrenador',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || '',
        };
        localStorage.setItem('bloodbowl-user', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        // Firebase user is signed out. Check if we have a local guest session.
        const savedUserJson = localStorage.getItem('bloodbowl-user');
        if (savedUserJson) {
            try {
                const savedUser = JSON.parse(savedUserJson);
                // If it's a guest user, keep them logged in.
                if (savedUser.id && savedUser.id.startsWith('guest-')) {
                    setUser(savedUser);
                } else {
                    // It was a Firebase user who is now logged out. Clean up storage and state.
                    localStorage.removeItem('bloodbowl-user');
                    setUser(null);
                }
            } catch {
                localStorage.removeItem('bloodbowl-user');
                setUser(null);
            }
        } else {
            // No Firebase user and no user in local storage.
            setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = async () => {
    if (!auth) {
        throw new Error("Firebase is not configured correctly. Cannot sign in with Google.");
    }
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider);
        // After this call, the page will redirect to Google's sign-in page.
        // The user state will be updated by the onAuthStateChanged listener
        // when they are redirected back to the app.
    } catch (error) {
        console.error("Google login with redirect failed to initiate:", error);
        // Re-throw the error so the calling component (Login.tsx) can handle it.
        throw error;
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
    // Check for auth availability first
    if (auth && user && !user.id.startsWith('guest-')) {
      // It's a Firebase user, sign them out.
      // The onAuthStateChanged listener will then clean up localStorage and state.
      signOut(auth).catch((error) => {
          console.error("Error signing out from Firebase:", error);
      });
    } else {
      // It's a guest user, or auth is not available. Just clear local state and storage.
      localStorage.removeItem('bloodbowl-user');
      setUser(null);
    }
  };
  
  const value = { user, login, logout, loginAsGuest, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
