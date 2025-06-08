import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PromptProps {
  question: string;
  answer: string;
  onPress?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

export default function Prompt({ question, answer, onPress, onLike, isLiked }: PromptProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <Pressable 
        style={styles.content}
        onPress={onLike}
      >
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.innerContent}>
          <Text style={styles.question}>{question}</Text>
          <Text style={styles.answer}>{answer}</Text>
          
          <View style={[styles.likeButton, isLiked && styles.likedButton]}>
            <Heart 
              size={20} 
              color={isLiked ? Colors.primary : Colors.primary}
              fill={isLiked ? Colors.primary : 'none'}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  content: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight + '80',
  },
  innerContent: {
    padding: 20,
    backgroundColor: Colors.backgroundLight + '90',
  },
  question: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  answer: {
    fontFamily: 'Merriweather-Italic',
    fontSize: 17,
    color: Colors.textLight,
    lineHeight: 24,
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight + '90',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  likedButton: {
    backgroundColor: Colors.backgroundLight,
    borderColor: Colors.primary,
  },
});