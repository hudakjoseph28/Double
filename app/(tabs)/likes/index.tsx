import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Heart, X } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  email: string;
  hasLikedMe?: boolean; // Whether this person already liked the current user
}

// Mock profiles for swiping
const mockProfiles: SwipeProfile[] = [
  {
    id: 'DD000002',
    name: 'Sarah',
    age: 26,
    bio: 'Adventure seeker, coffee lover, and weekend hiker. Looking for someone to explore the city with! 🌟',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=600&fit=crop&crop=face',
    ],
    email: 'dev2@double.com',
    hasLikedMe: true, // This will create a match for testing
  },
  {
    id: 'DD000005',
    name: 'Alex',
    age: 28,
    bio: 'Photographer, dog parent, and terrible cook. Can make you laugh but might burn dinner 😅',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face',
    ],
    email: 'alex@double.com',
    hasLikedMe: false,
  },
  {
    id: 'DD000006',
    name: 'Jamie',
    age: 25,
    bio: 'Yoga instructor, book club member, and aspiring chef. Let\'s cook together! 🍳',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1581824792737-cc8a042bfe3e?w=400&h=600&fit=crop&crop=face',
    ],
    email: 'jamie@double.com',
    hasLikedMe: false,
  },
];

export default function LikesScreen() {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<SwipeProfile[]>(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const currentProfile = profiles[currentIndex];

  const createMatch = (profile: SwipeProfile) => {
    // Create a new group chat for the match
    const chatId = `chat_${Date.now()}`;
    
    Alert.alert(
      "🎉 It's a Match!",
      `You and ${profile.name} liked each other! Start chatting now?`,
      [
        {
          text: 'Maybe Later',
          style: 'cancel',
        },
        {
          text: 'Start Chatting',
          onPress: () => {
            router.push(`/messages/${chatId}`);
          },
        },
      ]
    );
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentProfile) return;

    if (direction === 'right') {
      // User liked this profile
      if (currentProfile.hasLikedMe) {
        // It's a mutual match!
        createMatch(currentProfile);
      }
    }

    // Move to next profile
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      resetCard();
    }, 300);
  };

  const resetCard = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    rotate.value = withSpring(0);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
      rotate.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, SCREEN_WIDTH],
        [-30, 30],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe detected
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        translateX.value = withSpring(
          direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { damping: 15 }
        );
        
        runOnJS(handleSwipe)(direction);
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity,
    };
  });

  const likeIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return { opacity };
  });

  const passIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD / 2, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return { opacity };
  });

  const handleLikePress = () => {
    translateX.value = withSpring(SCREEN_WIDTH, { damping: 15 });
    handleSwipe('right');
  };

  const handlePassPress = () => {
    translateX.value = withSpring(-SCREEN_WIDTH, { damping: 15 });
    handleSwipe('left');
  };

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No more profiles!</Text>
          <Text style={styles.emptySubtitle}>Check back later for new matches</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Swipe right to like, left to pass</Text>
      </View>

      <View style={styles.cardContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Image source={{ uri: currentProfile.photos[0] }} style={styles.cardImage} />
            
            {/* Swipe indicators */}
            <Animated.View style={[styles.likeIndicator, likeIconStyle]}>
              <Heart size={40} color="#00ff00" fill="#00ff00" />
              <Text style={styles.likeText}>LIKE</Text>
            </Animated.View>
            
            <Animated.View style={[styles.passIndicator, passIconStyle]}>
              <X size={40} color="#ff0000" />
              <Text style={styles.passText}>PASS</Text>
            </Animated.View>

            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{currentProfile.name}</Text>
                <Text style={styles.age}>{currentProfile.age}</Text>
              </View>
              <Text style={styles.bio}>{currentProfile.bio}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.actionButtons}>
        <Pressable style={styles.passButton} onPress={handlePassPress}>
          <X size={28} color="#ff4444" />
        </Pressable>
        
        <Pressable style={styles.likeButton} onPress={handleLikePress}>
          <Heart size={28} color="#fff" fill="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  likeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#00ff00',
    marginTop: 4,
  },
  passIndicator: {
    position: 'absolute',
    top: 50,
    left: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  passText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#ff0000',
    marginTop: 4,
  },
  cardInfo: {
    padding: 20,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.text,
    marginRight: 8,
  },
  age: {
    fontFamily: 'Inter-Regular',
    fontSize: 22,
    color: Colors.textLight,
  },
  bio: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 60,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffeeee',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
