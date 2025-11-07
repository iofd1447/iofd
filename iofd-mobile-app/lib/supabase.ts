import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Récupérer les variables d'environnement
// Note: Vous devrez créer un fichier .env ou utiliser expo-constants pour les variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou clé manquante. Veuillez configurer les variables d\'environnement.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

