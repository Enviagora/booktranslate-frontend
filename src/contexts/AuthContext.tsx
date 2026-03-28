'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface UserProfile extends User {
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user metadata from auth
          const userMetadata = session.user.user_metadata || {};
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: (userMetadata.role as 'user' | 'admin') || 'user',
            is_blocked: userMetadata.is_blocked || false,
            created_at: session.user.created_at || new Date().toISOString(),
          };

          if (userProfile.is_blocked) {
            setUser(null);
            setError('Sua conta foi bloqueada.');
          } else {
            setUser(userProfile);
            setError(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userMetadata = session.user.user_metadata || {};
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          role: (userMetadata.role as 'user' | 'admin') || 'user',
          is_blocked: userMetadata.is_blocked || false,
          created_at: session.user.created_at || new Date().toISOString(),
        };

        if (userProfile.is_blocked) {
          setUser(null);
          setError('Sua conta foi bloqueada.');
          await supabase.auth.signOut();
        } else {
          setUser(userProfile);
          setError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          role: (userMetadata.role as 'user' | 'admin') || 'user',
          is_blocked: userMetadata.is_blocked || false,
          created_at: data.user.created_at || new Date().toISOString(),
        };

        if (userProfile.is_blocked) {
          await supabase.auth.signOut();
          throw new Error('Sua conta foi bloqueada.');
        }

        setUser(userProfile);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao fazer logout';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
