import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LifestyleSetupScreen() {
  const router = useRouter();
  const [relationshipStyle, setRelationshipStyle] = useState<string>('');
  const [intention, setIntention] = useState<string>('');
  const [school, setSchool] = useState<string>('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.8, // 80% progress
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const canContinue = relationshipStyle && intention && school.trim();

  const handleContinue = () => {
    if (canContinue) {
      router.push('./complete');
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
        <Text style={styles.progressText}>Step 4 of 5 • 80%</Text>
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lifestyle</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.titleContainer}>
              <Sparkles size={32} color={Colors.primary} />
              <Text style={styles.title}>Almost there!</Text>
              <Text style={styles.subtitle}>
                Tell us about your relationship goals and background
              </Text>
            </View>

            {/* Relationship Style */}
            <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Relationship Style</Text>
              <View style={styles.optionsGrid}>
                {[
                  'Monogamous',
                  'Ethically Non-monogamous',
                  'Open to Both',
                  'Prefer Not to Say'
                ].map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.option,
                      relationshipStyle === option && styles.selectedOption,
                    ]}
                    onPress={() => setRelationshipStyle(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      relationshipStyle === option && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </BlurView>

            {/* Intention */}
            <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>What are you looking for?</Text>
              <View style={styles.optionsGrid}>
                {[
                  'Long-term relationship',
                  'Something casual',
                  'New friends',
                  'Not sure yet'
                ].map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.option,
                      intention === option && styles.selectedOption,
                    ]}
                    onPress={() => setIntention(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      intention === option && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </BlurView>

            {/* School */}
            <BlurView intensity={20} tint="light" style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>School</Text>
              <TextInput
                style={styles.schoolInput}
                placeholder="Enter your school or university"
                placeholderTextColor={Colors.textLight}
                value={school}
                onChangeText={setSchool}
                autoCapitalize="words"
                returnKeyType="done"
                blurOnSubmit={true}
              />
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
      </KeyboardAvoidingView>
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
  selectedOption: {
    backgroundColor: Colors.primary,
  },
  selectedOptionText: {
    color: '#fff',
  },
  schoolInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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