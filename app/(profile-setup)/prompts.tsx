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
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROMPTS = [
  "My ideal first date would be...",
  "I'm looking for someone who...",
  "My biggest passion is...",
  "The way to my heart is...",
  "I'm secretly really good at...",
  "My perfect weekend involves...",
  "I can't live without...",
  "My friends would describe me as...",
  "I'm most proud of...",
  "My guilty pleasure is...",
];

interface SelectedPrompt {
  prompt: string;
  answer: string;
}

export default function PromptsSetupScreen() {
  const router = useRouter();
  const [selectedPrompts, setSelectedPrompts] = useState<SelectedPrompt[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.4, // 40% progress
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const selectPrompt = (prompt: string) => {
    if (selectedPrompts.length >= 3) return;
    
    const newPrompt: SelectedPrompt = { prompt, answer: '' };
    setSelectedPrompts(prev => [...prev, newPrompt]);
    setEditingIndex(selectedPrompts.length);
  };

  const updateAnswer = (index: number, answer: string) => {
    setSelectedPrompts(prev => 
      prev.map((item, i) => i === index ? { ...item, answer } : item)
    );
  };

  const removePrompt = (index: number) => {
    setSelectedPrompts(prev => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const canContinue = selectedPrompts.length === 3 && 
    selectedPrompts.every(p => p.answer.trim().length > 0);

  const handleContinue = () => {
    if (canContinue) {
      router.push('./basics');
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
        <Text style={styles.progressText}>Step 2 of 5 • 40%</Text>
      </View>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Prompts</Text>
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
              <MessageCircle size={32} color={Colors.primary} />
              <Text style={styles.title}>Tell your story</Text>
              <Text style={styles.subtitle}>
                Choose 3 prompts and write answers that show your personality
              </Text>
            </View>

            {/* Selected Prompts */}
            {selectedPrompts.map((item, index) => (
              <BlurView key={index} intensity={20} tint="light" style={styles.selectedPromptContainer}>
                <View style={styles.selectedPromptHeader}>
                  <Text style={styles.selectedPromptText}>{item.prompt}</Text>
                  <Pressable onPress={() => removePrompt(index)}>
                    <Text style={styles.removePromptText}>Remove</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Write your answer..."
                  placeholderTextColor={Colors.textLight}
                  value={item.answer}
                  onChangeText={(text) => updateAnswer(index, text)}
                  multiline
                  maxLength={150}
                  onFocus={() => setEditingIndex(index)}
                  onBlur={() => setEditingIndex(null)}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.characterCount}>
                  {item.answer.length}/150
                </Text>
              </BlurView>
            ))}

            {/* Available Prompts */}
            {selectedPrompts.length < 3 && (
              <View style={styles.availablePromptsContainer}>
                <Text style={styles.availablePromptsTitle}>
                  Choose {3 - selectedPrompts.length} more prompt{3 - selectedPrompts.length === 1 ? '' : 's'}:
                </Text>
                {PROMPTS.filter(prompt => 
                  !selectedPrompts.some(selected => selected.prompt === prompt)
                ).map((prompt, index) => (
                  <Pressable
                    key={index}
                    style={styles.promptOption}
                    onPress={() => selectPrompt(prompt)}
                  >
                    <Text style={styles.promptOptionText}>{prompt}</Text>
                    <ArrowRight size={16} color={Colors.textLight} />
                  </Pressable>
                ))}
              </View>
            )}
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
                {canContinue ? 'Continue' : `Complete ${3 - selectedPrompts.length} more prompt${3 - selectedPrompts.length === 1 ? '' : 's'}`}
              </Text>
              {canContinue && <ArrowRight size={20} color="#fff" style={styles.continueButtonIcon} />}
            </LinearGradient>
          </Pressable>
          
          <Text style={styles.promptCount}>
            {selectedPrompts.length} of 3 prompts completed
          </Text>
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
  selectedPromptContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedPromptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedPromptText: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  removePromptText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  answerInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
  },
  availablePromptsContainer: {
    marginTop: 24,
  },
  availablePromptsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  promptOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  promptOptionText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
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
  promptCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
}); 