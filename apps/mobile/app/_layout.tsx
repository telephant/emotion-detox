import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useUser } from '@/hooks/useUser';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const { isLoading: userLoading, error: userError, userId } = useUser();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize splash screen
  useEffect(() => {
    // Keep the splash screen visible until we're ready to hide it
    SplashScreen.preventAutoHideAsync();
  }, []);

  // Handle initialization logic
  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load and user to be initialized
        if (loaded && !userLoading) {
          // User device registration is complete
          // We can now hide the splash screen
          await SplashScreen.hideAsync();
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
      }
    }

    prepare();
  }, [loaded, userLoading]);

  // Don't render anything until everything is ready
  if (!appIsReady) {
    return null;
  }

  // If there was a user error during initialization, we could handle it here
  // For now we'll just continue to the app, possibly with offline functionality

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
