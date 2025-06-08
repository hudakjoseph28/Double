import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import { Heart, ChevronLeft, MessageSquare } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_USERS } from '@/verified/mockUsers';
import { getImageSource } from '@/utils/imageHelper';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Find the user from mock data
  const user = MOCK_USERS.find(user => user.id === id || user.username === id);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderImage = (imageUrl: string, index: number) => (
    <View key={`photo-${index}`} style={styles.imageContainer}>
      <Image source={getImageSource(imageUrl)} style={styles.image} />
      <View style={styles.imageBorder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.card}
        >
          {renderImage(user.photos[0], 0)}
          
          <View style={styles.infoSection}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            <Text style={styles.location}>{user.location}</Text>
          </View>

          {renderImage(user.photos[1], 1)}
          
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About {user.name}</Text>
            <Text style={styles.aboutText}>{user.about}</Text>
          </View>

          {user.prompts?.map((prompt, index) => (
            <View key={index} style={styles.promptContainer}>
              <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
          ))}

          {user.photos[2] && renderImage(user.photos[2], 2)}
          {user.photos[3] && renderImage(user.photos[3], 3)}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={[styles.actionButton, styles.messageButton]}>
          <MessageSquare size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Message</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.likeButton]}>
          <Heart size={24} color={Colors.textInverse} />
          <Text style={[styles.actionButtonText, styles.likeButtonText]}>Like</Text>
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
  card: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: Colors.backgroundLight,
    overflow: 'hidden',
    padding: 16,
  },
  imageContainer: {
    height: 400,
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
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  promptContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight + '80',
  },
  promptQuestion: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  promptAnswer: {
    fontFamily: 'Merriweather-Italic',
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
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
  actionBar: {
    flexDirection: 'row',
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    gap: 8,
  },
  messageButton: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  likeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  likeButtonText: {
    color: Colors.textInverse,
  },
}); 