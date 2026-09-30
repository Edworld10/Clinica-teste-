import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/initialData';
import { auth, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: User | null;
  isLoading: boolean;
  switchDemoRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  availableDemoUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default to patient (Laura Pereira)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to real Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        // If the authenticated user is the project owner
        const isOwner = user.email === 'sikhdiihpaw@gmail.com';
        setCurrentUser({
          id: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: isOwner ? 'admin' : 'paciente',
          organizationId: 'lucy-clinica-matriz',
          avatarUrl: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchDemoRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(target);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign in canceled or error:', err);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    // Reset to Laura Pereira (demo patient)
    setCurrentUser(DEMO_USERS[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        switchDemoRole,
        signInWithGoogle,
        signOut,
        availableDemoUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
