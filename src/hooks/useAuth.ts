import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseAuthStateChanged,
    User as FirebaseUser
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  import { User } from '../types';
  import { useState, useEffect } from 'react';
  
  export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  export const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  export const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };
  
  export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser;
  };
  
  export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
    return firebaseAuthStateChanged(auth, callback);
  };
  
  // Helper function to convert Firebase User to our User type
  export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      updatedAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
    };
  };

  // useAuth hook for managing authentication state
  export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Duração mínima pequena para permitir o fade-in sem atrasar muito
      const splashMinDurationMs = 700;
      const startedAt = Date.now();
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const unsubscribe = onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          setUser(convertFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }

        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, splashMinDurationMs - elapsed);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => setLoading(false), remaining);
      });

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        unsubscribe();
      };
    }, []);

    const saveCredentials = async (email: string, password: string) => {
      // This function can be used to save credentials securely
      // For now, we'll just return a promise that resolves
      return Promise.resolve();
    };

    return { user, loading, saveCredentials };
  }; 