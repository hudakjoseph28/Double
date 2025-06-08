import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Heart,
  Mail,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastService from '@/services/ToastService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const toastService = ToastService.getInstance();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const heartBeat = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendReset = async () => {
    if (isLoading) return;

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      toastService.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('[ForgotPassword] Failed to send reset email:', error);
      toastService.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    if (error) {
      setError('');
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#FFE3ED', '#FFF0F3', '#FFE5EC']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.successContainer}>
          <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
            <CheckCircle size={80} color={Colors.primary} />
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We've sent password reset instructions to {email}
            </Text>
            <Pressable
              style={styles.backToLoginButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFE3ED', '#FFF0F3', '#FFE5EC']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <BlurView intensity={20} tint="light" style={styles.backButtonBlur}>
              <ArrowLeft size={24} color={Colors.text} />
            </BlurView>
          </Pressable>

          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Animated.View style={[styles.brandingHearts, { transform: [{ scale: heartBeat }] }]}>
              <Heart size={40} color="#2B3F87" fill="none" strokeWidth={2.5} />
              <Heart
                size={40}
                color={Colors.primary}
                fill="none"
                strokeWidth={2.5}
                style={styles.secondHeart}
              />
            </Animated.View>
            <Text style={styles.logoText}>
              <Text style={{ color: '#2B3F87' }}>Dou</Text>
              <Text style={{ color: Colors.primary }}>ble</Text>
            </Text>
            <Text style={styles.tagline}>Reset your password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={30} tint="light" style={styles.formBlur}>
              <View style={styles.formContent}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, error && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor={Colors.textLight}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        clearError();
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSendReset}
                    />
                  </View>
                  {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                {/* Send Reset Button */}
                <Pressable
                  style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                  onPress={handleSendReset}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#E75480']}
                    style={styles.resetButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Back to Login Link */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>Remember your password? </Text>
                  <Pressable onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </Pressable>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE3ED',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
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
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  formBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  formContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 16,
  },
  resetButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: '#fff',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  backToLoginText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
});