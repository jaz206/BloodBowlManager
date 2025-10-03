import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { auth } from '../App';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Entrenador',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || '',
        };
        localStorage.setItem('bloodbowl-user', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        const savedUser = localStorage.getItem('bloodbowl-user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.id && parsedUser.id.startsWith('guest-')) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem('bloodbowl-user');
              setUser(null);
            }
          } catch {
            localStorage.removeItem('bloodbowl-user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error durante el inicio de sesión con Google:", error);
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
    signOut(auth);
    // Don't remove guest user data on logout, only when a real user logs in.
    // This preserves guest data if they just close the app.
  };
  
  const value = { user, login, logout, loginAsGuest, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};