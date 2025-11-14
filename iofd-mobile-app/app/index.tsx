import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading, isGuestMode, setGuestMode } = useAuth();

  React.useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)/contribute');
      } else if (isGuestMode) {
        router.replace('/(tabs)/scan');
      }
    }
  }, [user, loading, isGuestMode, router]);

  if (loading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
            IOFD
          </Text>
          <Text variant="titleLarge" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            Islamic Open Food Database
          </Text>
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          La plus grande base de données nutritionnelle pensée et alimentée par la Ummah
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={async () => {
            await setGuestMode(true);
            router.replace('/(tabs)/scan');
          }}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="magnify"
        >
          Consulter en invité
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Se connecter
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Créer un compte
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  hint: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    fontStyle: 'italic',
  },
  footer: {
    gap: 12,
    paddingBottom: 32,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

