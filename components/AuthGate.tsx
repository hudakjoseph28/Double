import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { 
    isSignedIn, 
    loading, 
    isProfileComplete, 
    justLoggedIn, 
    setJustLoggedIn,
    currentUser 
  } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Don't navigate while loading or already navigating
    if (loading || isNavigating) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProfileSetup = segments[0] === '(profile-setup)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('[AuthGate] Navigation Logic:', {
      isSignedIn,
      isProfileComplete,
      justLoggedIn,
      currentSegment: segments.join('/'),
      inAuthGroup,
      inProfileSetup,
      inTabsGroup
    });

    // SCENARIO 1 & 2: Not signed in - show login screen
    if (!isSignedIn) {
      if (!inAuthGroup) {
        console.log('[AuthGate] Not signed in - redirecting to login');
        setIsNavigating(true);
        router.replace('/(auth)/login');
        setTimeout(() => setIsNavigating(false), 500);
      }
      return;
    }

    // SCENARIO 1: Signed in but profile incomplete - redirect to profile setup
    if (isSignedIn && !isProfileComplete) {
      if (!inProfileSetup) {
        console.log('[AuthGate] Profile incomplete - redirecting to profile setup');
        setIsNavigating(true);
        router.replace('/(profile-setup)');
        setTimeout(() => setIsNavigating(false), 500);
      }
      return;
    }

    // SCENARIO 2 & 3: Signed in with complete profile - redirect to main app
    if (isSignedIn && isProfileComplete) {
      if (!inTabsGroup) {
        console.log('[AuthGate] Profile complete - redirecting to double screen');
        setIsNavigating(true);
        router.replace('/(tabs)/group');
        setTimeout(() => setIsNavigating(false), 500);
      }
      
      // Clear justLoggedIn flag after successful navigation to main app
      if (justLoggedIn && inTabsGroup) {
        console.log('[AuthGate] Clearing justLoggedIn flag');
        setTimeout(() => setJustLoggedIn(false), 1000);
      }
      return;
    }

    // Handle edge case: signed in user in auth screens
    if (isSignedIn && inAuthGroup) {
      if (!isProfileComplete) {
        console.log('[AuthGate] Signed in user in auth - redirecting to profile setup');
        setIsNavigating(true);
        router.replace('/(profile-setup)');
        setTimeout(() => setIsNavigating(false), 500);
      } else {
        console.log('[AuthGate] Signed in user in auth - redirecting to double screen');
        setIsNavigating(true);
        router.replace('/(tabs)/group');
        setTimeout(() => setIsNavigating(false), 500);
      }
    }
  }, [isSignedIn, isProfileComplete, loading, segments, justLoggedIn]);

  // Show elegant loading screen during navigation
  if (loading || isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FFE3ED', '#FFF0F3', '#FFE5EC']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View entering={FadeIn} style={styles.loadingContent}>
          <View style={styles.brandingHearts}>
            <Heart size={40} color="#2B3F87" fill="none" strokeWidth={2.5} />
            <Heart
              size={40}
              color={Colors.primary}
              fill="none"
              strokeWidth={2.5}
              style={styles.secondHeart}
            />
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: '#2B3F87' }}>Dou</Text>
            <Text style={{ color: Colors.primary }}>ble</Text>
          </Text>
          <Text style={styles.loadingText}>
            {loading ? 'Loading...' : 'Navigating...'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE3ED',
  },
  loadingContent: {
    alignItems: 'center',
  },
  brandingHearts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondHeart: {
    marginLeft: -20,
    marginTop: -2,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
}); 