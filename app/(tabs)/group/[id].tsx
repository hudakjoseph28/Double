import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import { mockGroups } from '@/data/mockData';
import { ChevronLeft, Heart, MapPin, Users, MessageSquare, Share2, Briefcase, GraduationCap } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabBarContext } from '../_layout';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageSource } from '@/data/mockUsers';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 60;

export default function ViewGroupScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useContext(TabBarContext);
  
  // Find the group from mockGroups
  const group = mockGroups.find(g => g.id === id);

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const onScroll = (event: any) => {
    const scrollDiff = event.nativeEvent.contentOffset.y;
    if (handleScroll) {
      handleScroll(scrollDiff);
    }
  };

  const renderUserSection = (user: any) => (
    <View style={styles.userSection}>
      <Image source={getImageSource(user.photo)} style={styles.userPhoto} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}, {user.age}</Text>
        
        <View style={styles.userDetails}>
          {user.occupation && (
            <View style={styles.detailRow}>
              <Briefcase size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>{user.occupation}</Text>
            </View>
          )}
          {user.education && (
            <View style={styles.detailRow}>
              <GraduationCap size={16} color={Colors.textLight} />
              <Text style={styles.detailText}>{user.education}</Text>
            </View>
          )}
        </View>

        {user.interests && (
          <View style={styles.interestsContainer}>
            {user.interests.map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{group.title}</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionButton}>
            <Share2 size={20} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.card}
        >
          {/* Group Photo */}
          <View style={styles.groupPhotoContainer}>
            <Image source={getImageSource(group.groupPhoto)} style={styles.groupPhoto} />
            <View style={styles.groupPhotoOverlay}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.groupInfo}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={16} color={Colors.textInverse} />
                  <Text style={styles.locationText}>{group.location}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Group Prompt */}
          {group.prompt && (
            <View style={styles.promptContainer}>
              <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
              <Text style={styles.promptQuestion}>{group.prompt.question}</Text>
              <Text style={styles.promptAnswer}>{group.prompt.answer}</Text>
            </View>
          )}

          {/* Users */}
          <View style={styles.usersContainer}>
            <Text style={styles.sectionTitle}>Group Members</Text>
            {renderUserSection(group.user1)}
            {renderUserSection(group.user2)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={[styles.actionButton, styles.messageButton]}>
              <MessageSquare size={24} color={Colors.textInverse} />
              <Text style={styles.actionButtonText}>Message</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.likeButton]}>
              <Heart size={24} color={Colors.textInverse} />
              <Text style={styles.actionButtonText}>Like</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
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
  headerActions: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
  },
  groupPhotoContainer: {
    height: 300,
    width: '100%',
  },
  groupPhoto: {
    width: '100%',
    height: '100%',
  },
  groupPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  groupInfo: {
    marginTop: 'auto',
  },
  groupTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.textInverse,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textInverse,
    marginLeft: 8,
    opacity: 0.9,
  },
  promptContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
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
  },
  usersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
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
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageButton: {
    backgroundColor: Colors.primary,
  },
  likeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.textInverse,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
});