import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Heart,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_REMEMBER_ME } from '@/constants/DevSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(DEFAULT_REMEMBER_ME);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { login } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const heartBeat = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password, rememberMe);
      // Navigation will be handled by AuthGate after successful login
    } catch (error) {
      console.error('[LoginScreen] Login failed:', error);
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
            <Text style={styles.tagline}>Welcome back</Text>
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
                      style={[styles.textInput, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor={Colors.textLight}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        clearError('email');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, errors.password && styles.inputError]}
                      placeholder="Password"
                      placeholderTextColor={Colors.textLight}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        clearError('password');
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={Colors.textLight} />
                      ) : (
                        <Eye size={20} color={Colors.textLight} />
                      )}
                    </Pressable>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsContainer}>
                  <Pressable
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Check size={14} color="#fff" strokeWidth={3} />}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </Pressable>

                  {/* Hide forgot password for dev demo */}
                  {email !== 'testing@gmail.com' && (
                    <Pressable onPress={() => router.push('/(auth)/forgot')}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </Pressable>
                  )}
                </View>

                {/* Login Button */}
                <Pressable
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#E75480']}
                    style={styles.loginButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Signup Link - Hide for dev demo */}
                {email !== 'testing@gmail.com' && (
                  <View style={styles.signupLinkContainer}>
                    <Text style={styles.signupLinkText}>Don't have an account? </Text>
                    <Pressable onPress={() => router.push('/(auth)/signup')}>
                      <Text style={styles.signupLink}>Create Account</Text>
                    </Pressable>
                  </View>
                )}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
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
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
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
    marginBottom: 20,
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
  eyeButton: {
    padding: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.textLight,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberMeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: '#fff',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLinkText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
  signupLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
});