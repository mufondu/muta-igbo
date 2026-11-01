import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CloudSync from '../components/CloudSync';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { AppProvider } from '../hooks/useAppState';
import AuthScreen from '../screens/AuthScreen';
import { injectWebStyles } from '../utils/webStyles';

// When Supabase is configured, parents must sign in before seeing the app.
// When it is not (local dev), the app opens directly as before.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, session } = useAuth();
  if (!enabled) return <>{children}</>;
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8E7' }}>
        <ActivityIndicator color="#1B2A6B" />
      </View>
    );
  }
  return session ? <>{children}</> : <AuthScreen />;
}

injectWebStyles();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <AppProvider>
            <CloudSync />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </AppProvider>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
