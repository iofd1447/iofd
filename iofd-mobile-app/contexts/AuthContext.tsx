import { supabase } from '@/lib/supabase';
import { StorageService } from '@/utils/storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuestMode: boolean;
  setGuestMode: (enabled: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [guestMode, sessionResult] = await Promise.allSettled([
          StorageService.getGuestMode(),
          Promise.race([
            supabase.auth.getSession(),
            new Promise<{ data: { session: Session | null } }>((resolve) =>
              setTimeout(() => resolve({ data: { session: null } }), 1500)
            )
          ])
        ]);
        
        const guestModeValue = guestMode.status === 'fulfilled' ? guestMode.value : false;
        const session = sessionResult.status === 'fulfilled' 
          ? sessionResult.value.data.session 
          : null;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          StorageService.clearGuestMode().catch(() => {});
          setIsGuestMode(false);
        } else {
          setIsGuestMode(guestModeValue);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        try {
          const guestMode = await StorageService.getGuestMode();
          setIsGuestMode(guestMode);
        } catch {
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Ne pas bloquer sur clearGuestMode, le faire en arrière-plan
        StorageService.clearGuestMode().catch(() => {});
        setIsGuestMode(false);
      } else {
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setGuestMode = async (enabled: boolean) => {
    await StorageService.setGuestMode(enabled);
    setIsGuestMode(enabled);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    await StorageService.clearGuestMode();
    setIsGuestMode(false);
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    if (data.user) {
      const { error: userError } = await supabase.from('users').insert([{
        auth_id: data.user.id,
        email: data.user.email,
        username: email.split('@')[0],
        role: 'user'
      }]);
      if (userError) console.error('Erreur insertion user:', userError);
    }
    
    setSession(data.session);
    setUser(data.user);
    await StorageService.clearGuestMode();
    setIsGuestMode(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuestMode, setGuestMode, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

