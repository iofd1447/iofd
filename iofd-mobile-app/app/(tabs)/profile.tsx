import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Text, useTheme } from 'react-native-paper';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut, loading: authLoading, isGuestMode, setGuestMode } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ contributions: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      setProfile(userData || { username: user.email?.split('@')[0] || 'Utilisateur', role: 'user' });

      const userId = userData?.id || user.id;
      const userEmail = user.email || '';

      const { count: contribCount } = await supabase
        .from('product_contributors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: reviewCount } = await supabase
        .from('community_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', userEmail);

      setStats({
        contributions: contribCount || 0,
        reviews: reviewCount || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'IO';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      contributor: 'Contributeur',
      user: 'Utilisateur',
    };
    return labels[role] || 'Utilisateur';
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" style={styles.loader} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Appbar.Header>
          <Appbar.Content title="Profil" />
        </Appbar.Header>
        <View style={styles.notLoggedIn}>
          <Text variant="titleLarge" style={styles.notLoggedInTitle}>
            Non connecté
          </Text>
          <Text variant="bodyMedium" style={[styles.notLoggedInText, { color: theme.colors.onSurfaceVariant }]}>
            Vous êtes en mode invité
          </Text>
          <Text variant="bodySmall" style={[styles.notLoggedInText, { color: theme.colors.onSurfaceVariant, marginTop: 8 }]}>
            Connectez-vous pour accéder à votre profil et contribuer à la base de données
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          >
            Se connecter
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.button}
          >
            Créer un compte
          </Button>
          {isGuestMode && (
            <Button
              mode="text"
              onPress={async () => {
                await setGuestMode(false);
                router.replace('/');
              }}
              style={styles.button}
              textColor={theme.colors.onSurfaceVariant}
            >
              Quitter le mode invité
            </Button>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Appbar.Header>
        <Appbar.Content title="Mon profil" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={getUserInitials()}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <Text variant="headlineSmall" style={styles.profileName}>
              {profile?.username || user.email?.split('@')[0] || 'Utilisateur'}
            </Text>
            <Text variant="bodyMedium" style={[styles.profileRole, { color: theme.colors.primary }]}>
              {getRoleLabel(profile?.role || 'user')}
            </Text>
            <Text variant="bodySmall" style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
              {user.email}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {stats.contributions}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Produits ajoutés
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.secondary }]}>
                {stats.reviews}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Avis laissés
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              style={styles.actionButton}
              textColor={theme.colors.error}
            >
              Déconnexion
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    marginBottom: 8,
    fontWeight: '500',
  },
  profileEmail: {
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  notLoggedInText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    width: '100%',
    maxWidth: 300,
  },
});

