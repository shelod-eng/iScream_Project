import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { auth, firebaseEnabled } from '@/lib/firebase';

type AuthValue = {
  enabled: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const enabled = firebaseEnabled();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setUser(null);
      return;
    }

    const a = auth;
    const unsub = onAuthStateChanged(a, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [enabled]);

  const value = useMemo<AuthValue>(
    () => ({
      enabled,
      loading,
      user,
      signIn: async (email, password) => {
        const a = auth;
        await signInWithEmailAndPassword(a, email.trim(), password);
      },
      signUp: async (email, password) => {
        const a = auth;
        await createUserWithEmailAndPassword(a, email.trim(), password);
      },
      signOut: async () => {
        const a = auth;
        await signOut(a);
      },
    }),
    [enabled, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}