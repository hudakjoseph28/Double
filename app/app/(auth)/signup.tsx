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
  User,
  Mail,
  Lock,
  ArrowLeft,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import UserService from '@/services/UserService';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { createAccount } = useAuth();

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!UserService.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordValidation = UserService.validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message || 'Invalid password';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Username validation
    const usernameValidation = UserService.validateUsername(formData.username);
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.message || 'Invalid username';
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await createAccount({
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
      });

      // Navigation will be handled by AuthGate after successful account creation
    } catch (error) {
      console.error('[SignupScreen] Signup failed:', error);
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
            <Text style={styles.tagline}>Create your account</Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={30} tint="light" style={styles.formBlur}>
              <View style={styles.formContent}>
                {/* Display Name Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, errors.displayName && styles.inputError]}
                      placeholder="Display Name"
                      placeholderTextColor={Colors.textLight}
                      value={formData.displayName}
                      onChangeText={(text) => updateFormData('displayName', text)}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
                </View>

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.atSymbol}>@</Text>
                    <TextInput
                      style={[styles.textInput, styles.usernameInput, errors.username && styles.inputError]}
                      placeholder="username"
                      placeholderTextColor={Colors.textLight}
                      value={formData.username}
                      onChangeText={(text) => updateFormData('username', text.toLowerCase())}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                  {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor={Colors.textLight}
                      value={formData.email}
                      onChangeText={(text) => updateFormData('email', text)}
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
                      value={formData.password}
                      onChangeText={(text) => updateFormData('password', text)}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirm Password"
                      placeholderTextColor={Colors.textLight}
                      value={formData.confirmPassword}
                      onChangeText={(text) => updateFormData('confirmPassword', text)}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={Colors.textLight} />
                      ) : (
                        <Eye size={20} color={Colors.textLight} />
                      )}
                    </Pressable>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                {/* Create Account Button */}
                <Pressable
                  style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#E75480']}
                    style={styles.signupButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Login Link */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>Already have an account? </Text>
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
  atSymbol: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textLight,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  usernameInput: {
    marginLeft: 0,
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
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
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
});