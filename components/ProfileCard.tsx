import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Image, TextInput, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Prompt from './Prompt';
import { Profile } from '@/types';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { getImageSource } from '@/data/mockUsers';

const { width, height } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_WIDTH = width - (CARD_PADDING * 2);
const IMAGE_HEIGHT = CARD_WIDTH * 1.25;

interface ProfileCardProps {
  profile: Profile;
  onNext: () => void;
  onScroll?: (value: number) => void;
}

export default function ProfileCard({ profile, onNext, onScroll }: ProfileCardProps) {
  const [likedPhotoIndex, setLikedPhotoIndex] = useState<number | null>(null);
  const [likedPrompts, setLikedPrompts] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const lastScrollY = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setLikedPhotoIndex(null);
    setLikedPrompts([]);
  }, [profile]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const scrollDiff = event.contentOffset.y - lastScrollY.value;
      lastScrollY.value = event.contentOffset.y;
      
      if (onScroll && Math.abs(scrollDiff) > 2) {
        runOnJS(onScroll)(scrollDiff);
      }
    },
  });

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = (index: number) => {
    setLikedPhotoIndex(index);
    scale.value = withSpring(1.05);
  };

  const handlePromptLike = (index: number) => {
    setLikedPrompts(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  const handleCancel = () => {
    scale.value = withSpring(1);
    setLikedPhotoIndex(null);
    setMessage('');
  };

  const handleSendLike = () => {
    setShowMatch(true);
    
    setTimeout(() => {
      if (isMounted.current) {
        opacity.value = withTiming(0, {}, () => {
          if (isMounted.current) {
            runOnJS(onNext)();
            runOnJS(setShowMatch)(false);
            runOnJS(setLikedPhotoIndex)(null);
            runOnJS(setMessage)('');
            opacity.value = withTiming(1);
            scale.value = withSpring(1);
          }
        });
      }
    }, 2000);
  };

  const handleSkip = () => {
    opacity.value = withTiming(0, {}, () => {
      if (isMounted.current) {
        runOnJS(onNext)();
        opacity.value = withTiming(1);
      }
    });
  };

  const renderImage = (imageUrl: string, index: number) => (
    <View key={`photo-${index}`} style={styles.imageContainer}>
      <Animated.Image 
        source={getImageSource(imageUrl)}
        style={[
          styles.image,
          index === likedPhotoIndex && scaleStyle,
        ]}
        resizeMode="cover"
      />
      <View style={styles.imageBorder} />
      <View style={styles.imageOverlay}>
        <Pressable 
          style={[
            styles.likeButton,
            index === likedPhotoIndex && styles.likedButton
          ]}
          onPress={() => handleLike(index)}
        >
          <Heart 
            size={24} 
            color={index === likedPhotoIndex ? Colors.primary : Colors.textInverse}
            fill={index === likedPhotoIndex ? Colors.primary : 'none'}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Animated.View 
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(200)}
        style={[styles.container, { opacity }]}
      >
        <View style={styles.header}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <Text style={styles.headerName}>{profile.name}, {profile.age}</Text>
          <Text style={styles.headerLocation}>{profile.location}</Text>
        </View>

        <Animated.ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
        >
          {renderImage(profile.photos[0], 0)}
          
          <Prompt
            question={profile.prompts[0].question}
            answer={profile.prompts[0].answer}
            onLike={() => handlePromptLike(0)}
            isLiked={likedPrompts.includes(0)}
          />
          
          {renderImage(profile.photos[1], 1)}
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About {profile.name}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{profile.age}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{profile.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Occupation</Text>
                <Text style={styles.infoValue}>Software Engineer</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Education</Text>
                <Text style={styles.infoValue}>Master's Degree</Text>
              </View>
            </View>
          </View>
          
          {renderImage(profile.photos[2], 2)}
          
          <Prompt
            question={profile.prompts[1].question}
            answer={profile.prompts[1].answer}
            onLike={() => handlePromptLike(1)}
            isLiked={likedPrompts.includes(1)}
          />
          
          {renderImage(profile.photos[3], 3)}
        </Animated.ScrollView>

        {likedPhotoIndex !== null && !showMatch && (
          <BlurView intensity={80} tint="light" style={styles.overlay}>
            <View style={styles.likeDialog}>
              <Text style={styles.likeName}>{profile.name}</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Add a comment"
                placeholderTextColor={Colors.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <View style={styles.dialogActions}>
                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.sendButton} onPress={handleSendLike}>
                  <Text style={styles.sendText}>Send Like</Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        )}

        {showMatch && (
          <Animated.View 
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.matchOverlay}
          >
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <Image 
              source={getImageSource(profile.photos[likedPhotoIndex || 0])}
              style={styles.matchImage}
            />
            <Text style={styles.matchText}>You liked {profile.name}!</Text>
            <Text style={styles.matchSubtext}>Keep exploring to find more matches</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Pressable 
        style={[styles.skipButton, { bottom: 80 }]} 
        onPress={handleSkip}
      >
        <X size={24} color={Colors.textLight} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    width: CARD_WIDTH,
    height: height - 140,
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
    marginVertical: CARD_PADDING,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    paddingHorizontal: 16,
  },
  headerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  headerLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  likeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
  },
  likedButton: {
    backgroundColor: Colors.backgroundLight,
  },
  infoSection: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: (CARD_WIDTH - 72) / 2,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  infoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  likeDialog: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  likeName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 16,
  },
  messageInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    borderRadius: 12,
    padding: 12,
    height: 80,
    backgroundColor: Colors.background,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: Colors.background,
  },
  cancelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  sendButton: {
    flex: 2,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: Colors.primary,
  },
  sendText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.textInverse,
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  matchText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textInverse,
    marginBottom: 8,
    textAlign: 'center',
  },
  matchSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textInverse,
    opacity: 0.8,
    textAlign: 'center',
  },
});