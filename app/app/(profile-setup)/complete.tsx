import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function CompleteSetupScreen() {
  const router = useRouter();
  const { markProfileComplete } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0.8)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mark profile as complete when this screen loads
    markProfileComplete();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1, // 100% progress
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const handleContinue = () => {
    // Navigation will be handled by AuthGate after profile completion
    console.log('[CompleteSetup] Profile setup complete - AuthGate will handle navigation');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFE3ED', '#FFF0F3', '#FFE5EC']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Complete! • 100%</Text>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.celebrationContainer}>
          <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
            <Sparkles size={60} color={Colors.primary} />
          </Animated.View>
          
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Your profile is complete and ready to find amazing connections on Double
          </Text>

          <View style={styles.completionBadge}>
            <Check size={24} color="#fff" />
            <Text style={styles.badgeText}>Profile Complete</Text>
          </View>
        </View>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={[Colors.primary, '#E75480']}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Start Exploring</Text>
            <ArrowRight size={20} color="#fff" style={styles.continueButtonIcon} />
          </LinearGradient>
        </Pressable>
        
        <Text style={styles.welcomeText}>
          Welcome to Double! 💕
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE3ED',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
  },
  sparkleContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  badgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  continueButtonIcon: {
    marginLeft: 4,
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
}); 