import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '@/src/store';
import { Colors } from '@/src/constants/theme';

export default function RootLayout() {
  const loadPersistedState = useAppStore((state) => state.loadPersistedState);

  useEffect(() => {
    loadPersistedState();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Log In',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            title: 'Sign Up',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="post-job" 
          options={{ 
            title: 'Post a Job',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="job/[id]" 
          options={{ 
            title: 'Job Details',
          }} 
        />
      </Stack>
    </>
  );
}
