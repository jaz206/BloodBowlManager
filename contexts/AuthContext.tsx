

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  loginAsGuest: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const ADMIN_UID = '5BxSxrB1JCdFEWONXX4nvlrVHEo2';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use a specific key for the guest user to avoid conflicts
const GUEST_USER_STORAGE_KEY = 'bloodbowl-guest-user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If auth is not initialized (due to config error), only check for guest session.
    if (!auth) {
      try {
        const guestUserJson = localStorage.getItem(GUEST_USER_STORAGE_KEY);
        if (guestUserJson) {
          setUser(JSON.parse(guestUserJson));
        }
      } catch {
        // Ignore parsing errors
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore (like isAdmin)
        let isAdminFlag = firebaseUser.uid === ADMIN_UID;

        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data && typeof data.isAdmin === 'boolean') {
                isAdminFlag = data.isAdmin;
              }
            }
          } catch (error) {
            console.error("Error fetching user admin status:", error);
          }
        }

        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Entrenador',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || '',
          isAdmin: isAdminFlag
        };

        // Ensure any guest data is cleared now that a real user is logged in.
        localStorage.removeItem(GUEST_USER_STORAGE_KEY);
        setUser(newUser);
      } else {
        // No Firebase user is signed in. Check if we are in guest mode.
        try {
          const guestUserJson = localStorage.getItem(GUEST_USER_STORAGE_KEY);
          if (guestUserJson) {
            setUser(JSON.parse(guestUserJson));
          } else {
            setUser(null);
          }
        } catch {
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
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will automatically handle the user state update.
    } catch (error) {
      console.error("Google login with popup failed:", error);
      throw error; // Re-throw to be caught by the UI component
    }
  };

  const loginAsGuest = () => {
    // Before logging in as guest, ensure any Firebase session is signed out.
    if (auth && auth.currentUser) {
      signOut(auth);
    }
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Invitado',
      email: '',
      picture: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'%3E%3Cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /%3E%3C/svg%3E%0A`,
    };
    localStorage.setItem(GUEST_USER_STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = () => {
    // Clear guest data regardless of user type
    localStorage.removeItem(GUEST_USER_STORAGE_KEY);

    // If it's a Firebase user, sign them out.
    // onAuthStateChanged will then set user to null.
    if (auth && auth.currentUser) {
      signOut(auth).catch((error) => {
        console.error("Error signing out from Firebase:", error);
      });
    } else {
      // If it's a guest user or auth doesn't exist, just clear the state.
      setUser(null);
    }
  };

  const value = { user, login, logout, loginAsGuest, isLoading, isAdmin: user?.isAdmin || false };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
