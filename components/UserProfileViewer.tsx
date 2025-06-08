import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Pressable, 
  Dimensions,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { ChevronLeft, UserPlus, Check, MapPin, Heart, GraduationCap, Home } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/services/UserService';
import GroupService from '@/services/GroupService';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ProfileData {
  photos: string[];
  prompts: Array<{ question: string; answer: string }>;
  age: string;
  height: string;
  gender: string;
  orientation: string;
  religion: string;
  drinking: string;
  smoking: string;
  friendly420: boolean;
  monogamy: boolean;
  hometown: string;
  school: string;
  intention: string;
  displayName: string;
  email: string;
  username: string;
  userId: string;
}

interface UserProfileViewerProps {
  user: User;
  onClose: () => void;
}

export default function UserProfileViewer({ user, onClose }: UserProfileViewerProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState<'none' | 'sending' | 'sent' | 'error'>('none');
  const [userInGroup, setUserInGroup] = useState(false);
  const [currentUserInGroup, setCurrentUserInGroup] = useState(false);

  useEffect(() => {
    loadProfileData();
    checkGroupStatus();
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Try to load profile data for this specific user
      const saved = await AsyncStorage.getItem(`@profile_data_${user.userId}`);
      
      if (saved) {
        const data = JSON.parse(saved);
        setProfileData(data);
      } else {
        // Fallback to basic user data if no profile data exists
        setProfileData({
          photos: [],
          prompts: [],
          age: '',
          height: '',
          gender: '',
          orientation: '',
          religion: '',
          drinking: '',
          smoking: '',
          friendly420: false,
          monogamy: true,
          hometown: '',
          school: '',
          intention: '',
          displayName: user.displayName,
          email: user.email,
          username: user.username,
          userId: user.userId,
        });
      }
    } catch (error) {
      console.error('[UserProfileViewer] Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGroupStatus = async () => {
    try {
      const groupService = GroupService.getInstance();
      
      // Check if target user is in a group
      const targetUserGroup = await groupService.getUserGroup(user.userId);
      setUserInGroup(!!targetUserGroup);
      
      // Check if current user is in a group
      if (currentUser) {
        const currentUserGroup = await groupService.getUserGroup(currentUser.userId);
        setCurrentUserInGroup(!!currentUserGroup);
        
        // Check if there's already a pending invite
        const sentInvites = await groupService.getSentInvites(currentUser.userId);
        const hasPendingInvite = sentInvites.some(invite => 
          invite.toUserId === user.userId && invite.status === 'pending'
        );
        
        if (hasPendingInvite) {
          setInviteStatus('sent');
        }
      }
    } catch (error) {
      console.error('Error checking group status:', error);
    }
  };

  const handleInviteToGroup = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to send invites');
      return;
    }

    if (currentUserInGroup) {
      Alert.alert('Already in Group', 'You are already in a group. Leave your current group first to invite someone new.');
      return;
    }

    if (userInGroup) {
      Alert.alert('User Unavailable', 'This user is already in a group.');
      return;
    }

    setInviteStatus('sending');

    try {
      const groupService = GroupService.getInstance();
      const result = await groupService.sendInvite(
        currentUser.userId,
        user.userId,
        currentUser.displayName,
        user.displayName
      );

      if (result.success) {
        setInviteStatus('sent');
        Alert.alert(
          'Invite Sent!', 
          `Your group invite has been sent to ${user.displayName}. They'll be notified and can accept or decline your invitation.`,
          [{ text: 'OK' }]
        );
      } else {
        setInviteStatus('error');
        Alert.alert('Error', result.error || 'Failed to send invite');
        setTimeout(() => setInviteStatus('none'), 2000);
      }
    } catch (error) {
      setInviteStatus('error');
      Alert.alert('Error', 'Failed to send invite. Please try again.');
      setTimeout(() => setInviteStatus('none'), 2000);
    }
  };

  const renderProfilePhoto = () => {
    const hasPhoto = profileData?.photos && profileData.photos.length > 0;
    
    return (
      <View style={styles.photoContainer}>
        {hasPhoto ? (
          <Image source={{ uri: profileData.photos[0] }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderInitial}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.photoBorder} />
      </View>
    );
  };

  const renderBasicInfo = () => (
    <View style={styles.basicInfo}>
      <Text style={styles.displayName}>{user.displayName}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      
      {profileData?.age && (
        <Text style={styles.ageLocation}>
          {profileData.age}{profileData.hometown ? ` • ${profileData.hometown}` : ''}
        </Text>
      )}
      
      {user.email.includes('@double.com') && (
        <View style={styles.botBadge}>
          <Text style={styles.botBadgeText}>🤖 Bot User</Text>
        </View>
      )}
    </View>
  );

  const renderStats = () => {
    if (!profileData) return null;

    const stats = [
      { label: 'Height', value: profileData.height, icon: null },
      { label: 'Looking for', value: profileData.intention, icon: Heart },
      { label: 'Hometown', value: profileData.hometown, icon: Home },
      { label: 'School', value: profileData.school, icon: GraduationCap },
    ].filter(stat => stat.value);

    if (stats.length === 0) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statHeader}>
                {stat.icon && <stat.icon size={16} color={Colors.primary} />}
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLifestyle = () => {
    if (!profileData) return null;

    const lifestyle = [
      { label: 'Drinking', value: profileData.drinking },
      { label: 'Smoking', value: profileData.smoking },
      { label: 'Religion', value: profileData.religion },
      { label: '420 Friendly', value: profileData.friendly420 ? 'Yes' : 'No' },
      { label: 'Monogamous', value: profileData.monogamy ? 'Yes' : 'No' },
    ].filter(item => item.value && item.value !== '');

    if (lifestyle.length === 0) return null;

    return (
      <View style={styles.lifestyleSection}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <View style={styles.lifestyleGrid}>
          {lifestyle.map((item, index) => (
            <View key={index} style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>{item.label}</Text>
              <Text style={styles.lifestyleValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPrompts = () => {
    if (!profileData?.prompts || profileData.prompts.length === 0) return null;

    const validPrompts = profileData.prompts.filter(p => p.question && p.answer);
    if (validPrompts.length === 0) return null;

    return (
      <View style={styles.promptsSection}>
        <Text style={styles.sectionTitle}>Prompts</Text>
        {validPrompts.map((prompt, index) => (
          <View key={index} style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            <Text style={styles.promptAnswer}>{prompt.answer}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPhotos = () => {
    if (!profileData?.photos || profileData.photos.length <= 1) return null;

    const additionalPhotos = profileData.photos.slice(1);

    return (
      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>More Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {additionalPhotos.map((photo, index) => (
            <View key={index} style={styles.additionalPhoto}>
              <Image source={{ uri: photo }} style={styles.additionalPhotoImage} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderInviteButton = () => {
    if (!currentUser || currentUser.userId === user.userId) {
      return null;
    }

    let buttonText = 'Invite to Group';
    let buttonColor: string = Colors.primary;
    let disabled = false;
    let icon = <UserPlus size={20} color="#fff" />;

    switch (inviteStatus) {
      case 'sending':
        buttonText = 'Sending...';
        disabled = true;
        break;
      case 'sent':
        buttonText = 'Invite Sent';
        buttonColor = Colors.success;
        icon = <Check size={20} color="#fff" />;
        disabled = true;
        break;
      case 'error':
        buttonText = 'Try Again';
        buttonColor = Colors.error;
        break;
    }

    if (currentUserInGroup) {
      buttonText = 'Already in Group';
      buttonColor = Colors.textLight;
      disabled = true;
    } else if (userInGroup) {
      buttonText = 'User in Group';
      buttonColor = Colors.textLight;
      disabled = true;
    }

    return (
      <Pressable
        style={[
          styles.inviteButton,
          { backgroundColor: buttonColor },
          disabled && styles.inviteButtonDisabled
        ]}
        onPress={handleInviteToGroup}
        disabled={disabled}
      >
        {icon}
        <Text style={styles.inviteButtonText}>{buttonText}</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backButton} onPress={onClose}>
          <ChevronLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{user.displayName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
          {renderProfilePhoto()}
          {renderBasicInfo()}
          {renderStats()}
          {renderLifestyle()}
          {renderPrompts()}
          {renderPhotos()}
        </Animated.View>
      </ScrollView>

      {/* Invite Button */}
      <View style={styles.inviteContainer}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        {renderInviteButton()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#fff',
  },
  photoBorder: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  displayName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 4,
  },
  username: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  ageLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  botBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  botBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    gap: 16,
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  statValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
  },
  lifestyleSection: {
    marginBottom: 32,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lifestyleItem: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: (width - 64) / 2,
  },
  lifestyleLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  lifestyleValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  promptsSection: {
    marginBottom: 32,
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  promptQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
  },
  promptAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  photosSection: {
    marginBottom: 32,
  },
  photosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  additionalPhoto: {
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: Colors.backgroundDark,
  },
  additionalPhotoImage: {
    width: '100%',
    height: '100%',
  },
  inviteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
  },
  inviteButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inviteButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  inviteButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
}); 