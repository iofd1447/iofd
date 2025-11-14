import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { darkTheme, lightTheme } from '@/constants/paperTheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Empêcher le masquage automatique du splash screen
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Composant interne qui gère le masquage du splash screen
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loading } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hideSplashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHiddenSplash = useRef(false);

  // Timeout de sécurité : masquer le splash screen après maximum 2.5 secondes
  // même si l'authentification n'est pas terminée
  useEffect(() => {
    hideSplashTimeoutRef.current = setTimeout(async () => {
      if (!hasHiddenSplash.current) {
        hasHiddenSplash.current = true;
        if (hideSplashTimeoutRef.current) {
          clearTimeout(hideSplashTimeoutRef.current);
        }
        await SplashScreen.hideAsync();
      }
    }, 2500);

    return () => {
      if (hideSplashTimeoutRef.current) {
        clearTimeout(hideSplashTimeoutRef.current);
      }
    };
  }, []);

  const onLayoutRootView = useCallback(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      if (isNavigationReady && !hasHiddenSplash.current) {
        const delay = !loading ? 50 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (!hasHiddenSplash.current) {
          hasHiddenSplash.current = true;
          if (hideSplashTimeoutRef.current) {
            clearTimeout(hideSplashTimeoutRef.current);
          }
          await SplashScreen.hideAsync();
        }
      }
    };

    if (isNavigationReady) {
      hideSplash();
    }
  }, [isNavigationReady, loading]);

  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="product/[barcode]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </PaperProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
