import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { IscreamProvider } from '@/lib/iscream';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <IscreamProvider>
          <AuthGate />
        </IscreamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { enabled, loading, user } = useAuth();

  const firstSeg = String((segments as any)[0] ?? '');
  const inAuth = firstSeg === 'login' || firstSeg === 'register';

  useEffect(() => {
    if (loading) return;

    // If Firebase isn't configured, allow demo mode.
    if (!enabled) return;

    if (!user && !inAuth) {
      router.replace('/login' as any);
      return;
    }

    if (user && inAuth) {
      router.replace('/(tabs)' as any);
    }
  }, [enabled, inAuth, loading, router, user]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Create account' }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="incidents" options={{ title: 'Incident History' }} />
      <Stack.Screen name="medical" options={{ title: 'Medical Profile' }} />
      <Stack.Screen name="assistant" options={{ title: 'iScream Bot' }} />
      <Stack.Screen name="places" options={{ title: 'Safe Places' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
