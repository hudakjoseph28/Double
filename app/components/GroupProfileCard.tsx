import React from 'react';
import { StyleSheet, View, Image, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, X, MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Group } from '@/types';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side

interface GroupProfileCardProps {
  group: Group;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
}

export default function GroupProfileCard({ 
  group,
  onLike,
  onPass,
  onMessage
}: GroupProfileCardProps) {
  const router = useRouter();

  const handleUserPress = (userId: string) => {
    router.push(`/(tabs)/profile/${userId}`);
  };

  return (
    <View style={styles.container}>
      {/* Main Profile Image */}
      <Image 
        source={{ uri: group.groupPhoto || group.photos?.[0] || '' }} 
        style={styles.mainImage}
        resizeMode="cover"
      />
      
      {/* Prompt Section */}
      {group.prompt && (
        <View style={styles.promptContainer}>
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.promptContent}>
            <Text style={styles.promptLabel}>{group.prompt.question}</Text>
            <Text style={styles.promptText}>{group.prompt.answer}</Text>
            <Pressable style={styles.likeButton}>
              <Heart size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Name and Info */}
      <View style={styles.infoContainer}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.name}>{group.title}</Text>
        <View style={styles.userNames}>
          <Pressable onPress={() => handleUserPress(group.user1.id)}>
            <Text style={styles.userName}>{group.user1.name}</Text>
          </Pressable>
          <Text style={styles.separator}> & </Text>
          <Pressable onPress={() => handleUserPress(group.user2.id)}>
            <Text style={styles.userName}>{group.user2.name}</Text>
          </Pressable>
          <Text style={styles.locationText}> • {group.location}</Text>
        </View>
      </View>

      {/* Image Grid */}
      <View style={styles.imageGrid}>
        <Pressable onPress={() => handleUserPress(group.user1.id)}>
          <Image
            source={{ uri: group.user1.photo }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        </Pressable>
        <Pressable onPress={() => handleUserPress(group.user2.id)}>
          <Image
            source={{ uri: group.user2.photo }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        </Pressable>
        <Image
          source={{ uri: group.groupPhotos?.[0] || group.photos?.[1] || '' }}
          style={styles.gridImage}
          resizeMode="cover"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={[styles.actionButton, styles.passButton]} onPress={onPass}>
          <X size={24} color={Colors.error} />
        </Pressable>
        
        <Pressable style={[styles.actionButton, styles.messageButton]} onPress={onMessage}>
          <MessageCircle size={24} color={Colors.primary} />
        </Pressable>
        
        <Pressable style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
          <Heart size={24} color={Colors.primary} fill={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: Colors.backgroundDark,
  },
  promptContainer: {
    position: 'absolute',
    top: 320,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promptContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  promptLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  promptText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
    marginRight: 12,
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  userNames: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  separator: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
  },
  imageGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  gridImage: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  passButton: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  messageButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
}); 