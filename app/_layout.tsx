import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import AuthGate from '@/components/AuthGate';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthGate>
          <Slot />
        </AuthGate>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
