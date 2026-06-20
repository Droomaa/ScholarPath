import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApplicationProviderHost } from '@/src/context/shared/ApplicationProviderHost';
import { InstituteApplicantsProvider } from '@/src/context/institute/InstituteApplicantsContext';
import { InstituteNotificationProvider } from '@/src/context/institute/InstituteNotificationContext';
import { InstituteProgramsProvider } from '@/src/context/institute/InstituteProgramsContext';
import { InstituteSessionProvider } from '@/src/context/institute/InstituteSessionContext';
import { InstituteTeamProvider } from '@/src/context/institute/InstituteTeamContext';
import { ExploreProgramsProvider } from '@/src/context/student/ExploreProgramsContext';
import { NotificationProvider } from '@/src/context/student/NotificationContext';
import { StudentSessionProvider } from '@/src/context/student/StudentSessionContext';
import { WishlistProvider } from '@/src/context/student/WishlistContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StudentSessionProvider>
        <ExploreProgramsProvider>
        <InstituteSessionProvider>
          <InstituteApplicantsProvider>
          <InstituteProgramsProvider>
          <InstituteNotificationProvider>
          <InstituteTeamProvider>
          <ApplicationProviderHost>
            <WishlistProvider>
              <NotificationProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(institute-tabs)" />
                    <Stack.Screen name="wishlist" />
                    <Stack.Screen name="edit-profile" />
                    <Stack.Screen name="notifications" />
                    <Stack.Screen name="ai-recommendation" />
                    <Stack.Screen name="program/[id]" />
                    <Stack.Screen name="program-register/[id]" />
                    <Stack.Screen name="track-application" />
                    <Stack.Screen name="institute-analytics" />
                    <Stack.Screen name="institute-settings" />
                    <Stack.Screen name="institute-manage-team" />
                    <Stack.Screen name="institute-edit-team-member/[id]" />
                    <Stack.Screen name="institute-edit-profile" />
                    <Stack.Screen name="institute-program/[id]" />
                    <Stack.Screen name="institute-applicant/[id]" />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </NotificationProvider>
            </WishlistProvider>
          </ApplicationProviderHost>
          </InstituteTeamProvider>
          </InstituteNotificationProvider>
          </InstituteProgramsProvider>
          </InstituteApplicantsProvider>
        </InstituteSessionProvider>
        </ExploreProgramsProvider>
      </StudentSessionProvider>
    </SafeAreaProvider>
  );
}
