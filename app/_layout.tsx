// ── FILE: app/_layout.tsx ─────────────────────────────────────────────────────
// Root layout: loads fonts, initializes DB, checks auth session, seeds data.

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Manrope_700Bold, Manrope_400Regular } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initDB, seedIfEmpty, fetchAllCards, fetchAllSubscriptions, getActiveSession } from '../db/client';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../components/ui/Toast';
import { COLORS } from '../constants/theme';

// Prevent auto-hide until fonts load.
void SplashScreen.preventAutoHideAsync().catch(() => { });

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps): React.JSX.Element {
  return (
    <View style={styles.errorRoot}>
      <Text style={styles.errorTitle}>Cardexa hit a startup error</Text>
      <Text style={styles.errorMessage}>{error.message || 'Unknown error'}</Text>
      <Pressable style={styles.errorButton} onPress={() => void retry()}>
        <Text style={styles.errorButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

function AuthGate({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  const { user, isCheckingSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isCheckingSession) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Not logged in, redirect to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Logged in but on auth screen, redirect to home
      router.replace('/');
    }
  }, [user, isCheckingSession, segments, router]);

  if (isCheckingSession) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const { setCards, setSubscriptions, setLoading } = useStore();
  const { setUser, setCheckingSession } = useAuthStore();

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    async function bootstrap() {
      try {
        await initDB(true);
        
        // Check for existing session
        const sessionUser = await getActiveSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
        setCheckingSession(false);

        // Load app data
        await seedIfEmpty();
        const [cards, subscriptions] = await Promise.all([
          fetchAllCards(),
          fetchAllSubscriptions(),
        ]);
        setCards(cards);
        setSubscriptions(subscriptions);
      } catch (err) {
        console.error('Bootstrap error:', err);
        setCheckingSession(false);
      } finally {
        setLoading(false);
        void SplashScreen.hideAsync().catch(() => { });
      }
    }

    bootstrap();
  }, [fontsLoaded, fontError, setCards, setSubscriptions, setLoading, setUser, setCheckingSession]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surfaceContainer} />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.surface } }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="subscriptions/[cardId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="add-card" options={{ presentation: 'modal' }} />
          <Stack.Screen name="advisor" options={{ presentation: 'card' }} />
          <Stack.Screen name="dna" options={{ presentation: 'card' }} />
        </Stack>
      </AuthGate>
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorRoot: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    color: COLORS.onSurface,
    fontSize: 24,
    fontWeight: '700',
  },
  errorMessage: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
  },
  errorButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorButtonText: {
    color: COLORS.onAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
