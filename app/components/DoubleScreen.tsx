import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ScrollView, Image, Pressable, Dimensions, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Heart, MessageCircle, SlidersHorizontal, GraduationCap, Cross, Handshake, Smile, MapPin, GlassWater, Cigarette, Users, Globe, TreePine, Cat, Languages, X, SkipForward, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut, 
  SlideInUp,
  SlideOutUp,
  useSharedValue, 
  withSpring, 
  withTiming,
  useAnimatedStyle
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DoubleIcon } from '@/components/icons/TabBarIcons';
import { notificationService } from '@/services/NotificationService';
import { analyticsService } from '@/services/AnalyticsService';
import GroupService, { Group } from '@/services/GroupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');
const IMAGE_RADIUS = 24;
const SECTION_GAP = 20;
const NAME_COLORS = ['#E75480', '#2B3F87'];
const HEADER_HEIGHT = 100;

interface GroupProfile {
  group: Group;
  user1Profile: any;
  user2Profile: any;
}

export default function DoubleScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // All state hooks must be at the top
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeModal, setLikeModal] = useState(false);
  const [messageMode, setMessageMode] = useState(false);
  const [message, setMessage] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [activeUser, setActiveUser] = useState(0);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const [showSkipTooltip, setShowSkipTooltip] = useState(false);
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [likeMessage, setLikeMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [scrollY, setScrollY] = useState(0);
  
  // All refs must be at the top
  const scrollViewRef = useRef<ScrollView>(null);
  const messageInputRef = useRef<TextInput>(null);
  
  // All animations must be at the top - added scroll-based header animation
  const glowAnim = useSharedValue(1);
  const userFlipAnim = useSharedValue(0);
  const fabScale = useSharedValue(1);
  const cardTransition = useSharedValue(0);
  const likeHeartScale = useSharedValue(1);
  const skipButtonScale = useSharedValue(1);
  const tooltipScale = useSharedValue(0);
  const imageZoom = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const toastOpacity = useSharedValue(0);
  const toastTranslateY = useSharedValue(50);
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  // All animated styles must be at the top - removed header animations
  const logoGlow = useAnimatedStyle(() => ({
    transform: [{ scale: glowAnim.value }],
  }));

  const fabAnim = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const userAnim = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ rotateY: `${userFlipAnim.value * 8}deg` }],
  }));

  const likeHeartAnim = useAnimatedStyle(() => ({
    transform: [{ scale: likeHeartScale.value }],
  }));

  const skipButtonAnim = useAnimatedStyle(() => ({
    transform: [{ scale: skipButtonScale.value }],
  }));

  const tooltipAnim = useAnimatedStyle(() => ({
    opacity: tooltipScale.value,
    transform: [{ scale: tooltipScale.value }],
  }));

  const imageZoomAnim = useAnimatedStyle(() => ({
    transform: [{ scale: imageZoom.value }],
  }));

  const overlayAnim = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const toastAnim = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastTranslateY.value }],
  }));

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Scroll handler for header hide/show
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const threshold = 50;
    
    if (currentScrollY > threshold && scrollY <= threshold) {
      // Hide header when scrolling down past threshold
      headerOpacity.value = withTiming(0, { duration: 300 });
      headerTranslateY.value = withTiming(-90, { duration: 300 });
    } else if (currentScrollY <= threshold && scrollY > threshold) {
      // Show header when scrolling back to top
      headerOpacity.value = withTiming(1, { duration: 300 });
      headerTranslateY.value = withTiming(0, { duration: 300 });
    }
    
    setScrollY(currentScrollY);
  };

  // Extract first names only
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // All effects must be at the top
  useEffect(() => {
    loadGroups();
    initializeServices();
  }, []);

  // Derived state - only calculate if we have groups
  const currentGroup = groups.length > 0 ? groups[currentGroupIndex] : null;
  const users = currentGroup ? [currentGroup.user1Profile, currentGroup.user2Profile] : [];
  const currentUserProfile = users.length > 0 ? users[activeUser] : null;

  const loadGroups = async () => {
    try {
      const groupService = GroupService.getInstance();
      const allGroups = await groupService.getAllGroups();
      
      if (allGroups.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // Filter out groups that contain the current user OR the dev account
      const filteredGroups = allGroups.filter(group => {
        if (currentUser) {
          // Hide current user's groups
          if (group.user1Id === currentUser.userId || group.user2Id === currentUser.userId) {
            return false;
          }
        }
        
        // Hide dev account from feed (Joey's personal account) - comprehensive filter
        const devEmails = ['hudakajoseph@gmail.com', 'hudaka.joseph@gmail.com', 'joey@doubledate.com'];
        const devUserIds = ['DD000001', 'DEMO001', 'USER001', 'JOEY001'];
        const devNames = ['Joey', 'Joseph Hudak', 'Hudak Joseph', 'Joey Hudak'];
        
        // Filter by email
        if (devEmails.includes(group.user1Name) || devEmails.includes(group.user2Name)) {
          return false;
        }
        
        // Filter by user ID
        if (devUserIds.includes(group.user1Id) || devUserIds.includes(group.user2Id)) {
          return false;
        }
        
        // Filter by display name
        if (devNames.includes(group.user1Name) || devNames.includes(group.user2Name)) {
          return false;
        }
        
        return true;
      });

      // High-quality college student photos from Unsplash with proper matching names
      const collegePhotos = [
        // Female college students
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face', // Sophia
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face', // Isabella  
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face', // Emma
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face', // Olivia
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face', // Ava
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face', // Mia
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face', // Charlotte
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&crop=face', // Amelia
        // Male college students  
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face', // Liam
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face', // Noah
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face', // Oliver
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face', // Elijah
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face', // William
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&crop=face', // James
        'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop&crop=face', // Benjamin
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&crop=face'  // Lucas
      ];

      // College-appropriate prompts
      const collegePrompts = [
        { question: "What's something you're learning?", answer: "How to balance studying and having fun" },
        { question: "My ideal Sunday", answer: "Brunch with friends and a good Netflix series" },
        { question: "I'm looking for", answer: "Someone who can make me laugh between classes" },
        { question: "Best way to ask me out", answer: "Coffee between lectures or study date at the library" },
        { question: "My simple pleasures", answer: "Late night pizza runs and spontaneous adventures" },
        { question: "I'm overly competitive about", answer: "Mario Kart and trivia nights" },
        { question: "The way to my heart is", answer: "Good music taste and terrible dad jokes" },
        { question: "I want someone who", answer: "Can keep up with my energy and ambition" }
      ];

      // Load detailed group profiles
      const groupProfiles: GroupProfile[] = [];
      
      for (const group of filteredGroups.slice(0, 15)) {
        try {
          const user1Data = await AsyncStorage.getItem(`@profile_data_${group.user1Id}`);
          const user2Data = await AsyncStorage.getItem(`@profile_data_${group.user2Id}`);
          
          let user1Profile, user2Profile;
          
          if (user1Data) {
            user1Profile = JSON.parse(user1Data);
          }
          if (user2Data) {
            user2Profile = JSON.parse(user2Data);
          }
          
          // Generate realistic college profiles with consistent name-photo mapping
          const nameToPhotoMap: { [key: string]: number } = {
            'Sophia Chen': 0, 'Isabella Rodriguez': 1, 'Emma Thompson': 2, 'Olivia Kim': 3,
            'Ava Martinez': 4, 'Mia Johnson': 5, 'Charlotte Davis': 6, 'Amelia Wilson': 7,
            'Liam Anderson': 8, 'Noah Williams': 9, 'Oliver Jones': 10, 'Elijah Brown': 11,
            'William Davis': 12, 'James Miller': 13, 'Benjamin Wilson': 14, 'Lucas Moore': 15
          };
          
          const user1PhotoIndex = nameToPhotoMap[group.user1Name] ?? Math.floor(Math.random() * collegePhotos.length);
          const user2PhotoIndex = nameToPhotoMap[group.user2Name] ?? Math.floor(Math.random() * collegePhotos.length);
          
          const user1PromptSet = collegePrompts.slice(0, 3);
          const user2PromptSet = collegePrompts.slice(3, 6);
          
          groupProfiles.push({
            group,
            user1Profile: user1Profile || { 
              displayName: group.user1Name, 
              photos: [
                collegePhotos[user1PhotoIndex],
                collegePhotos[(user1PhotoIndex + 2) % collegePhotos.length],
                collegePhotos[(user1PhotoIndex + 4) % collegePhotos.length],
                collegePhotos[(user1PhotoIndex + 6) % collegePhotos.length]
              ],
              age: Math.floor(Math.random() * 4) + 19, // 19-22
              location: 'San Francisco, CA',
              height: `5'${Math.floor(Math.random() * 12) + 1}"`,
              education: ['Stanford University', 'UC Berkeley', 'UCSF', 'USF'][Math.floor(Math.random() * 4)],
              work: ['Student', 'Part-time Barista', 'Research Assistant', 'Intern'][Math.floor(Math.random() * 4)],
              lookingFor: 'Someone genuine and fun',
              fitness: ['Active', 'Gym regular', 'Yoga lover', 'Runner'][Math.floor(Math.random() * 4)],
              drinking: ['Socially', 'Rarely', 'Never', 'Weekends only'][Math.floor(Math.random() * 4)],
              smoking: ['Never', 'Socially', 'Rarely'][Math.floor(Math.random() * 3)],
              kids: ['Want someday', 'Not sure', 'Want kids'][Math.floor(Math.random() * 3)],
              politics: ['Liberal', 'Moderate', 'Progressive'][Math.floor(Math.random() * 3)],
              religion: ['Agnostic', 'Spiritual', 'Not religious'][Math.floor(Math.random() * 3)],
              prompts: user1PromptSet
            },
            user2Profile: user2Profile || { 
              displayName: group.user2Name, 
              photos: [
                collegePhotos[user2PhotoIndex],
                collegePhotos[(user2PhotoIndex + 2) % collegePhotos.length],
                collegePhotos[(user2PhotoIndex + 4) % collegePhotos.length],
                collegePhotos[(user2PhotoIndex + 6) % collegePhotos.length]
              ],
              age: Math.floor(Math.random() * 4) + 19, // 19-22
              location: 'San Francisco, CA',
              height: `5'${Math.floor(Math.random() * 12) + 1}"`,
              education: ['Stanford University', 'UC Berkeley', 'UCSF', 'USF'][Math.floor(Math.random() * 4)],
              work: ['Student', 'Part-time Server', 'TA', 'Freelancer'][Math.floor(Math.random() * 4)],
              lookingFor: 'Adventure and good conversations',
              fitness: ['Active', 'Gym regular', 'Yoga lover', 'Runner'][Math.floor(Math.random() * 4)],
              drinking: ['Socially', 'Rarely', 'Never', 'Weekends only'][Math.floor(Math.random() * 4)],
              smoking: ['Never', 'Socially', 'Rarely'][Math.floor(Math.random() * 3)],
              kids: ['Want someday', 'Not sure', 'Want kids'][Math.floor(Math.random() * 3)],
              politics: ['Liberal', 'Moderate', 'Progressive'][Math.floor(Math.random() * 3)],
              religion: ['Agnostic', 'Spiritual', 'Not religious'][Math.floor(Math.random() * 3)],
              prompts: user2PromptSet
            },
          });
        } catch (error) {
          console.warn('[DoubleScreen] Error loading group profile:', error);
          // Still add the group with fallback data
          groupProfiles.push({
            group,
            user1Profile: { 
              displayName: group.user1Name, 
              photos: [collegePhotos[0]],
              age: '20',
              location: 'San Francisco, CA'
            },
            user2Profile: { 
              displayName: group.user2Name, 
              photos: [collegePhotos[1]],
              age: '21', 
              location: 'San Francisco, CA'
            },
          });
        }
      }
      
      setGroups(groupProfiles);
    } catch (error) {
      console.error('[DoubleScreen] Error loading groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const initializeServices = async () => {
    try {
      await notificationService.initialize();
      
      // Demo notification after 5 seconds
      setTimeout(() => {
        try {
          notificationService.sendLikeNotification('Alex', 'Cool Group');
        } catch (error) {
          console.warn('⚠️ Demo notification failed:', error);
        }
      }, 5000);

    } catch (error) {
      console.warn('⚠️ Error initializing services:', error);
    }
  };

  // Enhanced like handler with zoom-in blur overlay
  const handleLike = async () => {
    if (groups.length === 0 || !currentGroup) return;
    
    // Trigger zoom and overlay animation
    imageZoom.value = withSpring(1.1, { damping: 15 });
    overlayOpacity.value = withTiming(1, { duration: 300 });
    setShowLikeOverlay(true);
    
    // Auto-focus message input after animation
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 350);
  };

  // Send like with optional message
  const handleSendLike = async () => {
    if (!currentGroup) return;
    
    try {
      // Track the like action
      await analyticsService.trackEvent('like_sent', {
        action: 'like_group',
        groupId: currentGroup.group.id,
        targetUsers: [currentGroup.group.user1Name, currentGroup.group.user2Name],
        hasMessage: likeMessage.length > 0,
        messageLength: likeMessage.length,
      });

      // If user typed a message, create chat + send like
      if (likeMessage.length > 0) {
        // Create chat logic would go here
        await notificationService.sendMessageNotification(
          users[activeUser]?.displayName || 'User', 
          likeMessage.substring(0, 50) + (likeMessage.length > 50 ? '...' : '')
        );
      } else {
        // Just send like
        await notificationService.sendLikeNotification(
          users[activeUser]?.displayName || 'User', 
          `${currentGroup.group.user1Name} & ${currentGroup.group.user2Name}`
        );
      }

      // Close overlay with animation
      overlayOpacity.value = withTiming(0, { duration: 300 });
      imageZoom.value = withSpring(1, { damping: 15 });
      
      setTimeout(() => {
        setShowLikeOverlay(false);
        setLikeMessage('');
      }, 300);

      // Show success toast
      const groupNames = `${currentGroup.group.user1Name} & ${currentGroup.group.user2Name}`;
      setSuccessMessage(`You sent ${groupNames} a like 💖`);
      setShowSuccessToast(true);
      
      // Animate toast in
      toastOpacity.value = withTiming(1, { duration: 300 });
      toastTranslateY.value = withSpring(0, { damping: 15 });
      
      // Auto-hide toast after 2 seconds
      setTimeout(() => {
        toastOpacity.value = withTiming(0, { duration: 300 });
        toastTranslateY.value = withTiming(50, { duration: 300 });
        setTimeout(() => setShowSuccessToast(false), 300);
        
        // Move to next group
        moveToNextGroup();
      }, 2000);
      
    } catch (error) {
      console.warn('⚠️ Like sending failed:', error);
      // Still move to next group on error
      handleCancelLike();
      moveToNextGroup();
    }
  };

  // Cancel like overlay
  const handleCancelLike = () => {
    overlayOpacity.value = withTiming(0, { duration: 300 });
    imageZoom.value = withSpring(1, { damping: 15 });
    
    setTimeout(() => {
      setShowLikeOverlay(false);
      setLikeMessage('');
    }, 300);
  };

  // Enhanced skip with animation
  const handleSkip = async () => {
    if (groups.length === 0 || !currentGroup) return;
    
    try {
      // Trigger skip animation
      skipButtonScale.value = withSpring(0.8, { damping: 10 }, () => {
        skipButtonScale.value = withSpring(1);
      });
      
      // Show tooltip
      setShowSkipTooltip(true);
      tooltipScale.value = withSpring(1);
      
      await analyticsService.trackEvent('like_sent', {
        action: 'skip_group',
        groupId: currentGroup.group.id,
        targetUsers: [currentGroup.group.user1Name, currentGroup.group.user2Name],
      });
      
      // Hide tooltip and move to next
      setTimeout(() => {
        tooltipScale.value = withTiming(0, { duration: 300 });
        setTimeout(() => setShowSkipTooltip(false), 300);
        moveToNextGroup();
      }, 800);
    } catch (error) {
      console.warn('⚠️ Skip tracking failed:', error);
    }
  };

  const moveToNextGroup = () => {
    if (currentGroupIndex < groups.length - 1) {
      cardTransition.value = withSpring(1, { damping: 15 });
      setTimeout(() => {
        setCurrentGroupIndex(prev => prev + 1);
        setActiveUser(0);
        cardTransition.value = withSpring(0, { damping: 15 });
      }, 200);
    } else {
      // No more groups
      Alert.alert(
        'No More Groups',
        'You\'ve seen all available groups! Check back later for new matches.',
        [{ text: 'OK' }]
      );
    }
  };

  // User switch with card flip animation
  const handleUserSwitch = async (idx: number) => {
    if (idx === activeUser || groups.length === 0 || !currentGroup) return;
    
    try {
      await analyticsService.trackEvent('profile_viewed', {
        action: 'user_switch',
        fromUser: idx === 0 ? currentGroup.group.user2Name : currentGroup.group.user1Name,
        toUser: idx === 0 ? currentGroup.group.user1Name : currentGroup.group.user2Name,
        groupId: currentGroup.group.id,
      });
    } catch (error) {
      console.warn('⚠️ User switch tracking failed:', error);
    }
    
    userFlipAnim.value = withSpring(idx, { damping: 15, stiffness: 120 });
    setActiveUser(idx);
  };

  // Modern header with first names only and scroll animation
  const renderSleekHeader = () => {
    if (!currentGroup || users.length === 0) return null;
    
    // Use the actual displayName from the user profiles being shown
    const firstName1 = getFirstName(users[0]?.displayName || currentGroup.group.user1Name);
    const firstName2 = getFirstName(users[1]?.displayName || currentGroup.group.user2Name);
    
    return (
      <Animated.View style={[styles.sleekHeader, headerAnim]}>
        <BlurView intensity={60} tint="light" style={styles.headerBlur}>
          <View style={styles.sleekHeaderContent}>
            {/* Small logo at top left */}
            <View style={styles.miniLogoContainer}>
              <DoubleIcon color={Colors.primary} size={18} />
            </View>
            
            {/* First names only - moved up */}
            <View style={styles.groupInfoCenter}>
              <Text style={styles.sleekGroupNames} numberOfLines={1}>
                {firstName1} & {firstName2}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color={Colors.textLight} />
                <Text style={styles.sleekLocation}>San Francisco, CA</Text>
              </View>
            </View>
            
            {/* Functional filter button */}
            <Pressable 
              style={styles.sleekHeaderAction}
              onPress={() => setFilterModal(true)}
            >
              <SlidersHorizontal size={16} color={Colors.textLight} />
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  // Enhanced group photo with modern design and error fallback
  const renderGroupPhoto = () => {
    if (!currentGroup) return null;
    
    const fallbackImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face';
    
    return (
      <View style={styles.groupPhotoSection}>
        <Animated.View style={[styles.photoContainer, imageZoomAnim]}>
          <Image 
            source={{ uri: currentGroup.user1Profile?.photos?.[0] || currentGroup.user2Profile?.photos?.[0] || fallbackImage }} 
            style={styles.groupPhoto}
            onError={() => {
              // Image failed to load, fallback will be used
            }}
            defaultSource={{ uri: fallbackImage }}
          />
          
          {/* Like Button - Top Right Corner of Image */}
          <Pressable
            style={styles.modernLikeButton}
            onPress={handleLike}
            onPressIn={() => {
              likeHeartScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              likeHeartScale.value = withSpring(1);
            }}
          >
            <Animated.View style={[styles.modernLikeContent, likeHeartAnim]}>
              <BlurView intensity={80} tint="light" style={styles.likeButtonBlur} />
              <LinearGradient
                colors={['#FF6B9D', '#E75480']}
                style={styles.likeGradient}
              >
                <Heart size={20} color="#fff" fill="#fff" />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  // Fixed Skip Button - Outside image, above tab bar
  const renderFixedSkipButton = () => {
    return (
      <Pressable
        style={styles.fixedSkipButton}
        onPress={handleSkip}
        onPressIn={() => {
          skipButtonScale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          skipButtonScale.value = withSpring(1);
        }}
      >
        <Animated.View style={[styles.skipButtonContent, skipButtonAnim]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <X size={20} color={Colors.textLight} />
        </Animated.View>
      </Pressable>
    );
  };

  // User toggle tabs with premium styling
  const renderUserTabs = () => {
    if (!currentGroup || users.length === 0) return null;
    
    return (
      <View style={styles.userToggleRow}>
        {users.map((user, idx) => (
          <Pressable
            key={user.displayName || idx}
            onPress={() => handleUserSwitch(idx)}
            style={[styles.userToggleTab, activeUser === idx && styles.userToggleTabActive]}
          >
            <Text style={[styles.userToggleText, activeUser === idx && styles.userToggleTextActive]}>
              {user.displayName || user.name}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  // Isolated horizontal scroll - completely independent from vertical layout
  const renderQuickFactsRow = (user: any) => {
    const quickFacts = [
      { icon: '🙂', label: user?.age || '26' },
      { icon: '📍', label: user?.location || 'San Francisco' },
      { icon: '🎓', label: user?.education || 'College' },
      { icon: '💼', label: user?.work || 'Marketing' },
      { icon: '🏃‍♂️', label: user?.fitness || 'Active' },
      { icon: '🍷', label: user?.drinking || 'Socially' },
      { icon: '🚭', label: user?.smoking || 'Never' },
      { icon: '👥', label: user?.kids || 'Want kids' },
      { icon: '🌍', label: user?.politics || 'Liberal' },
      { icon: '⭐', label: user?.religion || 'Agnostic' },
    ];

    return (
      <View style={styles.quickFactsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFactsScroll}
          contentContainerStyle={styles.quickFactsContainer}
          nestedScrollEnabled={true}
        >
          {quickFacts.map((fact, index) => (
            <View key={index} style={styles.factChip}>
              <Text style={styles.factIcon}>{fact.icon}</Text>
              <Text style={styles.factLabel}>{fact.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Profile cards with cleaner styling
  const renderProfileCards = (user: any) => {
    const profileData = [
      { icon: '🎂', label: 'Age', value: user?.age || '26' },
      { icon: '📍', label: 'Location', value: user?.location || 'San Francisco, CA' },
      { icon: '📏', label: 'Height', value: user?.height || `5'8"` },
      { icon: '🎓', label: 'Education', value: user?.education || 'Stanford University' },
      { icon: '💼', label: 'Work', value: user?.work || 'Product Manager at Google' },
      { icon: '🌟', label: 'Looking for', value: user?.lookingFor || 'Long-term relationship' },
    ];

    return (
      <View style={styles.profileCardsContainer}>
        {profileData.map((item, index) => (
          <View key={index} style={styles.profileCard}>
            <View style={styles.profileCardLeft}>
              <Text style={styles.profileCardIcon}>{item.icon}</Text>
              <Text style={styles.profileCardLabel}>{item.label}</Text>
            </View>
            <Text style={styles.profileCardValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Hinge-style info layout
  const renderHingeStyleInfo = (user: any) => {
    return (
      <View style={styles.hingeInfoContainer}>
        {renderQuickFactsRow(user)}
        {renderProfileCards(user)}
      </View>
    );
  };

  // Single photo with like interaction and error fallback
  const renderSinglePhoto = (photo: string, user: any) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face';
    
    return (
      <View style={styles.largePhotoContainer}>
        <Image 
          source={{ uri: photo || fallbackImage }} 
          style={styles.largePhoto}
          onError={() => {
            // Image failed to load, fallback will be used
          }}
          defaultSource={{ uri: fallbackImage }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.photoGradient}
        />
      </View>
    );
  };

  // Single prompt card
  const renderSinglePrompt = (prompt: any, index: number) => {
    return (
      <View style={styles.promptCard}>
        <Text style={styles.promptTitle}>PROMPT {index + 1}</Text>
        <Text style={styles.promptQuestion}>{prompt.question}</Text>
        <Text style={styles.promptAnswer}>{prompt.answer}</Text>
      </View>
    );
  };

  // Complete user profile rendering
  const renderUserProfile = (user: any) => {
    if (!user) return null;

    const photos = user.photos || [];
    const prompts = user.prompts || [];

    return (
      <Animated.View style={[styles.userProfileSection, userAnim]}>
        {renderHingeStyleInfo(user)}
        
        <View style={styles.photosContainer}>
          {photos.slice(0, 4).map((photo: string, index: number) => (
            <View key={index} style={styles.photoSection}>
              {renderSinglePhoto(photo, user)}
              {index < prompts.length && renderSinglePrompt(prompts[index], index)}
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Modern like overlay with zoom and blur
  const renderLikeOverlay = () => {
    if (!showLikeOverlay || !currentGroup) return null;
    
    return (
      <Animated.View style={[styles.likeOverlay, overlayAnim]} pointerEvents={showLikeOverlay ? 'auto' : 'none'}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Pressable style={styles.overlayDismiss} onPress={handleCancelLike} />
        
        <Animated.View entering={ZoomIn.duration(300)} style={styles.likeModal}>
          <BlurView intensity={80} tint="light" style={styles.modalBlur} />
          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Like</Text>
            <Text style={styles.modalSubtitle}>
              to {currentGroup.group.user1Name} & {currentGroup.group.user2Name}
            </Text>
            
            <TextInput
              ref={messageInputRef}
              style={styles.messageInput}
              placeholder="Add a message (optional)"
              placeholderTextColor={Colors.textLight}
              value={likeMessage}
              onChangeText={setLikeMessage}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancelLike}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable style={styles.sendLikeButton} onPress={handleSendLike}>
                <LinearGradient
                  colors={['#FF6B9D', '#E75480']}
                  style={styles.sendLikeGradient}
                >
                  <Heart size={20} color="#fff" fill="#fff" />
                  <Text style={styles.sendLikeText}>Send Like</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  // Success toast notification
  const renderSuccessToast = () => {
    if (!showSuccessToast) return null;
    
    return (
      <Animated.View style={[styles.successToast, toastAnim]}>
        <BlurView intensity={80} tint="dark" style={styles.toastBlur} />
        <Text style={styles.toastText}>{successMessage}</Text>
      </Animated.View>
    );
  };

  // Enhanced like modal
  const renderLikeModal = () => {
    if (!currentGroup) return null;
    
    const groupPhotoUrl = currentGroup.user1Profile?.photos?.[0] || currentGroup.user2Profile?.photos?.[0];
    
    return (
      <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(250)}
        style={styles.modalOverlay}
      >
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <Animated.View entering={ZoomIn.duration(300)} exiting={ZoomOut.duration(300)} style={styles.modalCard}>
          <Image source={{ uri: groupPhotoUrl }} style={styles.modalPhoto} />
          <Text style={styles.modalTitle}>Send Like</Text>
          <Text style={styles.modalSubtitle}>to {currentGroup.group.user1Name} & {currentGroup.group.user2Name}</Text>
          
          <Pressable style={styles.modalButton} onPress={handleSkip}>
            <SkipForward size={22} color={Colors.primary} />
            <Text style={styles.modalButtonText}>Skip</Text>
          </Pressable>
          
          <Pressable style={styles.modalButton} onPress={() => {
            setMessageMode(false);
            try {
              analyticsService.trackEvent('like_sent', {
                action: 'quick_like',
                groupId: currentGroup.group.id,
                method: 'modal',
              });
            } catch (error) {
              console.warn('⚠️ Quick like tracking failed:', error);
            }
            handleLike();
          }}>
            <Heart size={22} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.modalButtonText}>Send Like</Text>
          </Pressable>
          
          <Pressable style={styles.modalButton} onPress={() => {
            setMessageMode(true);
            try {
              analyticsService.trackEvent('message_sent', {
                action: 'message_mode_activated',
                groupId: currentGroup.group.id,
              });
            } catch (error) {
              console.warn('⚠️ Message mode tracking failed:', error);
            }
          }}>
            <MessageCircle size={22} color={Colors.primary} />
            <Text style={styles.modalButtonText}>Send Message</Text>
          </Pressable>
          
          {messageMode && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.messageInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Write something nice..."
                placeholderTextColor={Colors.textLight}
                value={message}
                onChangeText={setMessage}
                autoFocus
                multiline
              />
            </Animated.View>
          )}
          
          <Pressable style={styles.confirmButton} onPress={async () => { 
            if (!currentGroup) return;
            
            // Track the send action
            try {
              await analyticsService.trackEvent(messageMode ? 'message_sent' : 'like_sent', {
                action: 'confirmed_send',
                groupId: currentGroup.group.id,
                hasMessage: messageMode && message.length > 0,
                messageLength: message.length,
              });
            } catch (error) {
              console.warn('⚠️ Send action tracking failed:', error);
            }

            // Trigger notifications
            try {
              if (messageMode && message.length > 0) {
                await notificationService.sendMessageNotification(
                  users[activeUser]?.displayName || 'User', 
                  message.substring(0, 50) + (message.length > 50 ? '...' : '')
                );
              } else {
                await notificationService.sendLikeNotification(
                  users[activeUser]?.displayName || 'User', 
                  `${currentGroup.group.user1Name} & ${currentGroup.group.user2Name}`
                );
              }
            } catch (error) {
              console.warn('⚠️ Notification sending failed:', error);
            }

            setLikeModal(false); 
            setMessageMode(false); 
            setMessage(''); 
          }}>
            <Text style={styles.confirmButtonText}>Send</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  // Remove the filter modal since we're going back to original
  const renderFilterModal = () => {
    return null;
  };

  // Conditional rendering based on state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <DoubleIcon color={Colors.primary} size={48} />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (groups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Groups Available</Text>
          <Text style={styles.emptySubtitle}>
            There are no groups to show right now. Check back later for new matches!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {renderSleekHeader()}
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          ref={scrollViewRef}
          onScroll={handleScroll}
        >
          {renderGroupPhoto()}
          
          {/* User Tabs with improved spacing */}
          <View style={styles.userTabsSection}>
            {renderUserTabs()}
          </View>
          
          {/* User Profile with proper section spacing */}
          {users[activeUser] && (
            <View style={styles.userProfileWrapper}>
              {renderUserProfile(users[activeUser])}
            </View>
          )}
        </ScrollView>

        {/* Fixed Skip Button - Always visible above tab bar */}
        {renderFixedSkipButton()}

        {likeModal && renderLikeModal()}
        {renderLikeOverlay()}
        {renderSuccessToast()}
        {renderFilterModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  sleekHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 95,
    zIndex: 100,
    paddingTop: 50,
  },
  headerBlur: {
    flex: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  sleekHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  miniLogoContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  groupInfoCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sleekGroupNames: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sleekLocation: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textLight,
    letterSpacing: -0.2,
  },
  sleekHeaderAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    paddingTop: 110,
  },
  scrollContent: {
    paddingBottom: 140,
    gap: 16,
  },
  groupPhotoSection: {
    width: width * 0.92,
    alignSelf: 'center',
    aspectRatio: 1.1,
    position: 'relative',
    marginBottom: 4,
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
  },
  groupPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: IMAGE_RADIUS,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: IMAGE_RADIUS,
  },
  modernLikeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernLikeContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  likeGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedSkipButton: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  skipButtonContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hingeInfoContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  quickFactsWrapper: {
    width: '100%',
    marginBottom: 16,
    height: 50,
  },
  quickFactsScroll: {
    width: '100%',
  },
  quickFactsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  factChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
    minWidth: 70,
  },
  factIcon: {
    fontSize: 16,
  },
  factLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: Colors.text,
  },
  profileCardsContainer: {
    width: '90%',
    alignSelf: 'center',
    gap: 6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginVertical: 2,
    alignSelf: 'center',
  },
  profileCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileCardIcon: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
  },
  profileCardLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: Colors.text,
    opacity: 0.7,
  },
  profileCardValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  photosContainer: {
    width: width * 0.92,
    gap: 16,
  },
  photoSection: {
    width: width * 0.92,
    alignSelf: 'center',
  },
  largePhotoContainer: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  largePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  photoGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  promptCardsContainer: {
    width: '100%',
    gap: 16,
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  promptTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  promptQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  promptAnswer: {
    fontFamily: 'Merriweather-Italic',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
    opacity: 0.85,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 28,
    alignItems: 'center',
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  modalPhoto: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    marginVertical: 6,
    width: '100%',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  modalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  messageInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  },
  likeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  likeModal: {
    width: width * 0.88,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 1001,
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    padding: 28,
    alignItems: 'center',
    gap: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  sendLikeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sendLikeGradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendLikeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  successToast: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  toastText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  likeButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  quickFactsSection: {
    width: '100%',
    marginBottom: 24,
  },
  profileCardsSection: {
    width: '100%',
  },
  userTabsSection: {
    width: '100%',
    marginBottom: 12,
  },
  userProfileWrapper: {
    width: '100%',
  },
  userToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 24,
  },
  userToggleTab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  userToggleTabActive: {
    backgroundColor: Colors.primary + '25',
    shadowOpacity: 0.15,
    borderColor: Colors.primary + '30',
  },
  userToggleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.textLight,
  },
  userToggleTextActive: {
    color: Colors.primary,
  },
  userProfileSection: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  filterModal: {
    width: width * 0.88,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 1001,
  },
  filterModalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  filterContent: {
    padding: 28,
    alignItems: 'center',
    gap: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  filterTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  filterSection: {
    width: '100%',
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  filterValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  sliderContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sliderTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    width: 40,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  ageSeparator: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  interestText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  applyFiltersButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  applyFiltersGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  applyFiltersText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  profileTagsContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  profileTagsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameTag: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  nameTagText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  infoTag: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  infoTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  detailTableContainer: {
    width: '90%',
    alignSelf: 'center',
    gap: 8,
    marginBottom: 24,
  },
  detailTableCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  detailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
}); 