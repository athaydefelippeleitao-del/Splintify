import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkIfAdmin } from '../services/tracksService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<{error: any}>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<{error: any}>;
  logout: () => Promise<void>;
  updateUserProfile: (photoURL: string) => Promise<{error: any}>;
  activateAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const admin = await checkIfAdmin(session.user.id);
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const admin = await checkIfAdmin(session.user.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (photoURL: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: photoURL }
    });
    if (!error && data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const activateAdmin = async () => {
    if (user) {
      setIsAdmin(true); // Optimistic UI update
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, isAdmin, loading, login, loginWithEmail, signUpWithEmail, logout, updateUserProfile, activateAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
