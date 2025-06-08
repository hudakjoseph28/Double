import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Image, Dimensions, InteractionManager, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, Users, MessageSquare, Share2, Camera, Music2, MapPin, Coffee, Clock, Trophy, Target, Palette, Compass, Crown, Focus, ChevronDown, Sparkles, Smile, Book, Dumbbell, Briefcase, GraduationCap } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Group, Prompt as PromptType, GroupMember } from '@/types';
import Animated, { 
  FadeIn, 
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import Prompt from './Prompt';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getImageSource, getGroupImageSource, getProfileImageSource } from '@/utils/imageHelper';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const IMAGE_HEIGHT = CARD_WIDTH * 1.25;
const VISIBLE_THRESHOLD = 2; // Number of images to keep in memory above and below current view

interface GroupCardProps {
  group: Group;
  onNext?: () => void;
  onScroll?: (value: number) => void;
  isViewOnly?: boolean;
}

const AnimatedScrollView = Animated.ScrollView;

export default function GroupCard({ group, onNext, onScroll, isViewOnly }: GroupCardProps) {
  const router = useRouter();
  const [likedPhotos, setLikedPhotos] = useState<number[]>([]);
  const [likedPrompts, setLikedPrompts] = useState<number[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [visiblePhotoIndices, setVisiblePhotoIndices] = useState<number[]>([0]);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const lastScrollY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const loadedImages = useRef<Set<number>>(new Set([0]));

  // Ensure we have photos to display
  const photos = group.photos || [];
  if (photos.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No photos available</Text>
      </View>
    );
  }

  const updateVisiblePhotos = useCallback((indices: number[]) => {
    // Only keep images in memory that are within the threshold
    const currentIndex = Math.floor(lastScrollY.value / (IMAGE_HEIGHT + 16));
    const start = Math.max(0, currentIndex - VISIBLE_THRESHOLD);
    const end = Math.min(photos.length - 1, currentIndex + VISIBLE_THRESHOLD);
    
    const newIndices = indices.filter(i => i >= start && i <= end);
    setVisiblePhotoIndices(newIndices);
    
    // Preload next few images
    InteractionManager.runAfterInteractions(() => {
      for (let i = currentIndex + 1; i <= end; i++) {
        if (!loadedImages.current.has(i) && photos[i]) {
          Image.prefetch(photos[i]);
          loadedImages.current.add(i);
        }
      }
    });
  }, [photos]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const scrollDiff = event.contentOffset.y - lastScrollY.value;
      lastScrollY.value = event.contentOffset.y;
      
      if (onScroll && Math.abs(scrollDiff) > 2) {
        runOnJS(onScroll)(scrollDiff);
      }

      // Calculate which photos should be visible based on scroll position
      const scrollY = event.contentOffset.y;
      const visibleStartY = scrollY;
      const visibleEndY = scrollY + height;

      const indices: number[] = [];
      photos.forEach((_photo: string, index: number) => {
        const photoY = index * (IMAGE_HEIGHT + 16);
        if (photoY >= visibleStartY - IMAGE_HEIGHT && photoY <= visibleEndY + IMAGE_HEIGHT) {
          indices.push(index);
        }
      });

      runOnJS(updateVisiblePhotos)(indices);
    }
  });

  const handlePhotoLike = (index: number) => {
    if (isViewOnly) return;
    
    if (likedPhotos.includes(index)) {
      setLikedPhotos(likedPhotos.filter(i => i !== index));
    } else {
      setLikedPhotos([...likedPhotos, index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePromptLike = (index: number) => {
    if (isViewOnly) return;

    if (likedPrompts.includes(index)) {
      setLikedPrompts(likedPrompts.filter(i => i !== index));
    } else {
      setLikedPrompts([...likedPrompts, index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderImage = (photo: string, index: number) => {
    if (!photo || !visiblePhotoIndices.includes(index)) {
      return <View key={`photo-placeholder-${index}`} style={[styles.imageContainer, { height: IMAGE_HEIGHT }]} />;
    }

    return (
      <View key={`photo-${index}`} style={styles.imageContainer}>
        <Animated.Image 
          source={getImageSource(photo)}
          style={[styles.image]}
          resizeMode="cover"
          fadeDuration={300}
          onLoad={() => {
            loadedImages.current.add(index);
          }}
        />
        <View style={styles.imageBorder} />
        {!isViewOnly && (
          <View style={styles.imageOverlay}>
            <Pressable 
              style={[
                styles.likeButton,
                likedPhotos.includes(index) && styles.likedButton
              ]}
              onPress={() => handlePhotoLike(index)}
            >
              <Heart 
                size={24} 
                color={likedPhotos.includes(index) ? Colors.primary : Colors.textInverse}
                fill={likedPhotos.includes(index) ? Colors.primary : 'none'}
              />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderUserInfo = (user: GroupMember, index: number) => (
    <View style={styles.infoSection} key={`user-${index}`}>
      <Text style={styles.name}>{user.name}, {user.age}</Text>
      <View style={styles.detailsRow}>
        {user.occupation && (
          <View style={styles.detailItem}>
            <Briefcase size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{user.occupation}</Text>
          </View>
        )}
        {user.education && (
          <View style={styles.detailItem}>
            <GraduationCap size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{user.education}</Text>
          </View>
        )}
      </View>
      {user.interests && (
        <View style={styles.interestsContainer}>
          {user.interests.map((interest: string, i: number) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPrompt = (prompt: PromptType, index: number) => (
    <View style={styles.promptContainer} key={`prompt-${index}`}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <Text style={styles.promptQuestion}>{prompt.question}</Text>
      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
      {!isViewOnly && (
        <Pressable 
          style={[styles.likeButton, likedPrompts.includes(index) && styles.likedButton]}
          onPress={() => handlePromptLike(index)}
        >
          <Heart 
            size={24} 
            color={likedPrompts.includes(index) ? Colors.primary : Colors.text}
            fill={likedPrompts.includes(index) ? Colors.primary : 'none'}
          />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { opacity }]}
      >
        <View style={styles.header}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <Text style={styles.headerName}>{group.title || group.name}</Text>
          <Text style={styles.headerLocation}>{group.location}</Text>
        </View>

        <AnimatedScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          removeClippedSubviews={true}
        >
          {/* Group Photo */}
          <View style={styles.imageContainer}>
            <Image 
              source={getGroupImageSource(group)} 
              style={styles.image}
              resizeMode="cover"
              onError={(error) => {
                console.warn('Group image failed to load:', error.nativeEvent.error);
              }}
            />
            <View style={styles.imageBorder} />
            {!isViewOnly && (
              <View style={styles.imageOverlay}>
                <Pressable 
                  style={[styles.likeButton, likedPhotos.includes(0) && styles.likedButton]}
                  onPress={() => handlePhotoLike(0)}
                >
                  <Heart 
                    size={24} 
                    color={likedPhotos.includes(0) ? Colors.primary : Colors.textInverse}
                    fill={likedPhotos.includes(0) ? Colors.primary : 'none'}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Group Prompt */}
          {group.prompt && renderPrompt(group.prompt, 0)}

          {/* User 1 Info */}
          {renderUserInfo(group.user1, 1)}
          
          {/* User 1 Photos */}
          {group.user1.photos?.map((photo, index) => (
            <View key={`user1-photo-${index}`} style={styles.imageContainer}>
              <Image 
                source={getImageSource(photo)} 
                style={styles.image} 
                resizeMode="cover"
                onError={(error) => {
                  console.warn('User photo failed to load:', error.nativeEvent.error);
                }}
              />
              <View style={styles.imageBorder} />
              {!isViewOnly && (
                <View style={styles.imageOverlay}>
                  <Pressable 
                    style={[styles.likeButton, likedPhotos.includes(index + 1) && styles.likedButton]}
                    onPress={() => handlePhotoLike(index + 1)}
                  >
                    <Heart 
                      size={24} 
                      color={likedPhotos.includes(index + 1) ? Colors.primary : Colors.textInverse}
                      fill={likedPhotos.includes(index + 1) ? Colors.primary : 'none'}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          {/* User 1 Prompts */}
          {group.user1.prompts?.map((prompt, index) => renderPrompt(prompt, index + 1))}

          {/* User 2 Info */}
          {renderUserInfo(group.user2, 2)}

          {/* User 2 Photos */}
          {group.user2.photos?.map((photo, index) => (
            <View key={`user2-photo-${index}`} style={styles.imageContainer}>
              <Image 
                source={getImageSource(photo)} 
                style={styles.image} 
                resizeMode="cover"
                onError={(error) => {
                  console.warn('User photo failed to load:', error.nativeEvent.error);
                }}
              />
              <View style={styles.imageBorder} />
              {!isViewOnly && (
                <View style={styles.imageOverlay}>
                  <Pressable 
                    style={[styles.likeButton, likedPhotos.includes(index + 5) && styles.likedButton]}
                    onPress={() => handlePhotoLike(index + 5)}
                  >
                    <Heart 
                      size={24} 
                      color={likedPhotos.includes(index + 5) ? Colors.primary : Colors.textInverse}
                      fill={likedPhotos.includes(index + 5) ? Colors.primary : 'none'}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          {/* User 2 Prompts */}
          {group.user2.prompts?.map((prompt, index) => renderPrompt(prompt, index + 3))}
        </AnimatedScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerLocation: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.divider,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  likeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  likedButton: {
    backgroundColor: Colors.primary + '20',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textLight,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  promptContainer: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight + '80',
    marginBottom: 24,
  },
  promptQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  promptAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  }
});