import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Heart,
  Camera,
  MessageCircle,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

interface SetupStep {
  id: string;
  title: string;
  progress: number;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
}

export default function ProfileSetupWelcomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartBeat = useRef(new Animated.Value(1)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  const setupSteps: SetupStep[] = [
    {
      id: 'photos',
      title: 'Add Photos',
      progress: 20,
      icon: <Camera size={20} color={Colors.primary} />,
      route: './photos',
      completed: completedSteps.includes('photos'),
    },
    {
      id: 'prompts',
      title: 'Choose Prompts',
      progress: 40,
      icon: <MessageCircle size={20} color={Colors.primary} />,
      route: './prompts',
      completed: completedSteps.includes('prompts'),
    },
    {
      id: 'basics',
      title: 'Basic Info',
      progress: 60,
      icon: <User size={20} color={Colors.primary} />,
      route: './basics',
      completed: completedSteps.includes('basics'),
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      progress: 80,
      icon: <Sparkles size={20} color={Colors.primary} />,
      route: './lifestyle',
      completed: completedSteps.includes('lifestyle'),
    },
  ];

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Heart beat animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animations for feature icons
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: -12,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStartSetup = () => {
    console.log('[ProfileSetup] Starting setup, navigating to photos');
    router.push('./photos');
  };

  const handleStepPress = (step: SetupStep) => {
    console.log(`[ProfileSetup] Navigating to step: ${step.id}`);
    router.push(step.route as any);
  };

  const overallProgress = (completedSteps.length / setupSteps.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFE3ED', '#FFF0F3', '#FFE5EC', '#F8E8FF']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating background elements */}
      <Animated.View style={[styles.floatingIcon, styles.floatingIcon1, { transform: [{ translateY: floatAnim1 }] }]} pointerEvents="none">
        <Camera size={24} color="rgba(255, 59, 124, 0.3)" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, styles.floatingIcon2, { transform: [{ translateY: floatAnim2 }] }]} pointerEvents="none">
        <MessageCircle size={20} color="rgba(43, 63, 135, 0.3)" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, styles.floatingIcon3, { transform: [{ translateY: floatAnim3 }] }]} pointerEvents="none">
        <Sparkles size={18} color="rgba(255, 59, 124, 0.4)" />
      </Animated.View>

      <View style={styles.container}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View style={[styles.brandingHearts, { transform: [{ scale: heartBeat }] }]}>
            <Heart size={50} color="#2B3F87" fill="none" strokeWidth={2.5} />
            <Heart
              size={50}
              color={Colors.primary}
              fill="none"
              strokeWidth={2.5}
              style={styles.secondHeart}
            />
          </Animated.View>
          
          <Text style={styles.welcomeTitle}>
            Welcome to Double, {currentUser?.displayName}!
          </Text>
          
          <Text style={styles.welcomeSubtitle}>
            Let's set up your profile to find your perfect double date match
          </Text>

          {/* Overall Progress */}
          {overallProgress > 0 && (
            <View style={styles.overallProgressContainer}>
              <Text style={styles.overallProgressText}>
                {Math.round(overallProgress)}% Complete
              </Text>
              <View style={styles.overallProgressBar}>
                <View style={[styles.overallProgressFill, { width: `${overallProgress}%` }]} />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Setup Steps */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <BlurView intensity={20} tint="light" style={styles.progressBlur}>
            <Text style={styles.progressTitle}>Your Setup Journey</Text>
            <View style={styles.stepsContainer}>
              {setupSteps.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.stepItem,
                    step.completed && styles.stepItemCompleted,
                  ]}
                  onPress={() => handleStepPress(step)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.stepIcon,
                    step.completed && styles.stepIconCompleted,
                  ]}>
                    {step.completed ? (
                      <CheckCircle size={20} color="#fff" fill={Colors.primary} />
                    ) : (
                      step.icon
                    )}
                  </View>
                  <Text style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={[
                    styles.stepProgress,
                    step.completed && styles.stepProgressCompleted,
                  ]}>
                    {step.progress}%
                  </Text>
                  <ArrowRight 
                    size={16} 
                    color={step.completed ? Colors.primary : Colors.textLight} 
                    style={styles.stepArrow}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </Animated.View>

        {/* Start Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]} pointerEvents="box-none">
          <Pressable style={styles.startButton} onPress={handleStartSetup}>
            <LinearGradient
              colors={[Colors.primary, '#E75480', '#FF6B9D']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startButtonText}>Let's Get Started</Text>
              <ArrowRight size={20} color="#fff" style={styles.startButtonIcon} />
            </LinearGradient>
          </Pressable>
          
          <Text style={styles.timeEstimate}>Takes about 3-5 minutes</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE3ED',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  floatingIcon1: {
    top: height * 0.15,
    right: width * 0.1,
  },
  floatingIcon2: {
    top: height * 0.3,
    left: width * 0.08,
  },
  floatingIcon3: {
    top: height * 0.7,
    right: width * 0.15,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  brandingHearts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  secondHeart: {
    marginLeft: -25,
    marginTop: -3,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  progressBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  stepsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 124, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  stepProgress: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
  },
  startButtonIcon: {
    marginLeft: 4,
  },
  timeEstimate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  overallProgressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  overallProgressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  overallProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginTop: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  stepItemCompleted: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepIconCompleted: {
    backgroundColor: 'rgba(255, 59, 124, 0.2)',
  },
  stepTextCompleted: {
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  stepProgressCompleted: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  stepArrow: {
    marginLeft: 8,
  },
}); 