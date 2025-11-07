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
    // Charger l'état du mode invité et la session
    const initializeAuth = async () => {
      try {
        // Charger l'état du mode invité
        const guestMode = await StorageService.getGuestMode();
        
        // Vérifier la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si l'utilisateur est connecté, désactiver le mode invité
        if (session?.user) {
          await StorageService.clearGuestMode();
          setIsGuestMode(false);
        } else {
          setIsGuestMode(guestMode);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur est connecté, désactiver le mode invité
      if (session?.user) {
        await StorageService.clearGuestMode();
        setIsGuestMode(false);
      } else {
        // Si déconnecté, ne pas réactiver automatiquement le mode invité
        // L'utilisateur devra le réactiver manuellement s'il le souhaite
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
    // Désactiver le mode invité lors de la connexion
    await StorageService.clearGuestMode();
    setIsGuestMode(false);
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    // Créer l'utilisateur dans la table users
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
    // Désactiver le mode invité lors de l'inscription
    await StorageService.clearGuestMode();
    setIsGuestMode(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    // Ne pas réactiver automatiquement le mode invité à la déconnexion
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

