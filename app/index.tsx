import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Colors from '@/constants/Colors';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Merriweather_400Regular,
  Merriweather_400Regular_Italic,
} from '@expo-google-fonts/merriweather';

SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  useFrameworkReady();
  const router = useRouter();
  const { isSignedIn, inGroup, isProfileComplete, loading } = useAuth();

  const fadeAnim     = useRef(new Animated.Value(1)).current;
  const scaleAnim    = useRef(new Animated.Value(0.9)).current;
  const rotateAnim1  = useRef(new Animated.Value(0)).current;
  const rotateAnim2  = useRef(new Animated.Value(0)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current; // For transform (native driver)
  const circleScaleAnim = useRef(new Animated.Value(0)).current; // For transform (native driver)
  const circleOpacityAnim = useRef(new Animated.Value(0)).current; // For opacity (native driver)
  const spinAnim     = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Merriweather-Regular': Merriweather_400Regular,
    'Merriweather-Italic': Merriweather_400Regular_Italic,
  });

  useEffect(() => {
    if (!fontsLoaded || fontError || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim1, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim2, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();

    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartScaleAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circleScaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(spinAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(spinAnim, {
              toValue: 2,
              duration: 800,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(spinAnim, {
              toValue: 3,
              duration: 600,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      const t2 = setTimeout(async () => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(async () => {
          await SplashScreen.hideAsync();
          
          // Redirect based on auth state
          if (!isSignedIn) {
            router.replace('/(auth)/login');
            return null;
          }

          if (!isProfileComplete) {
            router.replace('/(profile-setup)');
            return null;
          }

          router.replace('/(tabs)/group');
        });
      }, 1500); // Reduced time for faster testing

      return () => clearTimeout(t2);
    }, 800);

    return () => clearTimeout(t1);
  }, [fontsLoaded, fontError, loading, isSignedIn, isProfileComplete, inGroup]);

  if (!fontsLoaded || loading) return null;

  const rotate1     = rotateAnim1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const rotate2     = rotateAnim2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-90deg'] });
  const spin        = spinAnim.interpolate({ inputRange: [0, 1, 2, 3], outputRange: ['0deg', '360deg', '720deg', '1080deg'] });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Animated.View
          style={[styles.splashContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
          pointerEvents="none"
        >
          <View style={styles.logoContainer}>
            <View style={styles.animationContainer}>
              <Animated.View style={[styles.heart, { transform: [{ scale: heartScaleAnim }, { rotate: rotate1 }] }]}>
                <View style={[styles.heartShape, { backgroundColor: '#2B3F87' }]} />
              </Animated.View>
              <Animated.View style={[styles.heart, styles.secondHeart, { transform: [{ scale: heartScaleAnim }, { rotate: rotate2 }] }]}>
                <View style={[styles.heartShape, { backgroundColor: Colors.primary }]} />
              </Animated.View>
              <Animated.View style={[styles.loadingCircle, { opacity: circleOpacityAnim, transform: [{ scale: circleScaleAnim }, { rotate: spin }] }]}>
                <View style={styles.circleGradient} />
              </Animated.View>
            </View>
            <Animated.Text style={[styles.logoText, { opacity: textFadeAnim }]}>
              <Text style={{ color: '#2B3F87' }}>Dou</Text>
              <Text style={{ color: Colors.primary }}>ble</Text>
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.background },
  splashContainer:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, backgroundColor: Colors.background },
  logoContainer:     { alignItems: 'center' },
  animationContainer:{ width: 80, height: 80, marginBottom: 24, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  heart:             { position: 'absolute', width: 40, height: 40 },
  heartShape:        { width: '100%', height: '100%', borderRadius: 20 },
  secondHeart:       { marginLeft: 20, marginTop: 20 },
  loadingCircle:     { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: Colors.background },
  circleGradient:    { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 28, borderWidth: 4, borderLeftColor: '#2B3F87', borderTopColor: Colors.primary, borderRightColor: Colors.primary, borderBottomColor: '#2B3F87' },
  logoText:          { fontFamily: 'Inter-Bold', fontSize: 48 },
});
