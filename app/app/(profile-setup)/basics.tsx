import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  User,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BasicsSetupScreen() {
  const router = useRouter();
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string>('');
  const [orientation, setOrientation] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.6, // 60% progress
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const canContinue = age && gender && orientation && height;

  const handleContinue = () => {
    if (canContinue) {
      router.push('./lifestyle');
    }
  };

  const handleBack = () => {
    router.back();
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
        <Text style={styles.progressText}>Step 3 of 5 • 60%</Text>
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Basic Info</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.titleContainer}>
            <User size={32} color={Colors.primary} />
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              Help us find your perfect match with some basic information
            </Text>
          </View>

          {/* Age Selection */}
          <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Age</Text>
            <View style={styles.ageGrid}>
              {Array.from({ length: 43 }, (_, i) => i + 18).map((ageOption) => (
                <Pressable
                  key={ageOption}
                  style={[
                    styles.ageOption,
                    age === ageOption && styles.selectedOption,
                  ]}
                  onPress={() => setAge(ageOption)}
                >
                  <Text style={[
                    styles.ageOptionText,
                    age === ageOption && styles.selectedOptionText,
                  ]}>
                    {ageOption}
                  </Text>
                </Pressable>
              ))}
            </View>
          </BlurView>

          {/* Gender Selection */}
          <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.optionsGrid}>
              {['Woman', 'Man', 'Non-binary', 'Other'].map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.option,
                    gender === option && styles.selectedOption,
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[
                    styles.optionText,
                    gender === option && styles.selectedOptionText,
                  ]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </BlurView>

          {/* Orientation Selection */}
          <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sexual Orientation</Text>
            <View style={styles.optionsGrid}>
              {['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Other'].map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.option,
                    orientation === option && styles.selectedOption,
                  ]}
                  onPress={() => setOrientation(option)}
                >
                  <Text style={[
                    styles.optionText,
                    orientation === option && styles.selectedOptionText,
                  ]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </BlurView>

          {/* Height Selection */}
          <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Height</Text>
            <View style={styles.heightGrid}>
              {[
                "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"",
                "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"",
                "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"",
                "6'4\"", "6'5\"", "6'6\"", "6'7\"+"
              ].map((heightOption) => (
                <Pressable
                  key={heightOption}
                  style={[
                    styles.heightOption,
                    height === heightOption && styles.selectedOption,
                  ]}
                  onPress={() => setHeight(heightOption)}
                >
                  <Text style={[
                    styles.heightOptionText,
                    height === heightOption && styles.selectedOptionText,
                  ]}>
                    {heightOption}
                  </Text>
                </Pressable>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={canContinue ? [Colors.primary, '#E75480'] : ['#ccc', '#aaa']}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {canContinue && <Check size={20} color="#fff" style={styles.continueButtonIcon} />}
            <Text style={styles.continueButtonText}>
              {canContinue ? 'Continue' : 'Complete all fields to continue'}
            </Text>
            {canContinue && <ArrowRight size={20} color="#fff" style={styles.continueButtonIcon} />}
          </LinearGradient>
        </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageOption: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ageOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  heightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heightOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  heightOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
  },
  selectedOptionText: {
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
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.7,
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
    marginHorizontal: 8,
    textAlign: 'center',
  },
  continueButtonIcon: {
    marginHorizontal: 4,
  },
}); 