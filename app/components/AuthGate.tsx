import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Text, View } from 'react-native';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isProfileComplete, inGroup, loading, justLoggedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const currentPath = String(segments);
    const inAuthGroup = currentPath.includes('auth');
    const inProfileSetup = currentPath.includes('profile-setup');
    const inTabs = currentPath.includes('tabs');

    console.log('[AuthGate] Current state:', {
      isSignedIn,
      isProfileComplete,
      inGroup,
      justLoggedIn,
      segments: currentPath,
      inAuthGroup,
      inProfileSetup,
      inTabs
    });

    if (!isSignedIn) {
      // User is not signed in, redirect to login
      if (!inAuthGroup) {
        console.log('[AuthGate] Redirecting to login - user not signed in');
        router.replace('/(auth)/login' as any);
      }
    } else if (!isProfileComplete) {
      // User is signed in but profile is incomplete
      if (!inProfileSetup) {
        console.log('[AuthGate] Redirecting to profile setup - profile incomplete');
        router.replace('/(profile-setup)' as any);
      }
    } else {
      // User is fully authenticated and profile is complete
      if (inAuthGroup || inProfileSetup) {
        console.log('[AuthGate] Redirecting to main app - user fully authenticated');
        router.replace('/(tabs)/group' as any);
      }
    }
  }, [isSignedIn, isProfileComplete, inGroup, loading, justLoggedIn, segments]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
} 