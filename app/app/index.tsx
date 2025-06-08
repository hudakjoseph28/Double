import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isSignedIn, isProfileComplete, inGroup } = useAuth();

  useEffect(() => {
    console.log('[Index] useEffect triggered with state:', {
      isSignedIn,
      isProfileComplete,
      inGroup
    });

    // Wait for auth context to initialize
    if (isSignedIn === null) {
      console.log('[Index] Auth state still null, waiting...');
      return;
    }

    if (!isSignedIn) {
      // Not signed in, go to login
      console.log('[Index] Not signed in, redirecting to login');
      router.navigate('/(auth)/login');
    } else if (!isProfileComplete) {
      // Signed in but profile not complete, go to profile setup
      console.log('[Index] Profile incomplete, redirecting to profile setup');
      router.navigate('/(profile-setup)');
    } else {
      // Signed in with complete profile, go to main tabs
      console.log('[Index] Fully authenticated, redirecting to group screen');
      router.navigate('/(tabs)/group');
    }
  }, [isSignedIn, isProfileComplete, inGroup, router]);

  // Show loading screen while determining route
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
