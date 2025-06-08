import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, MessageCircle, MapPin, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getImageSource } from '@/utils/imageHelper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const IMAGE_WIDTH = width - (CARD_PADDING * 2);
const GROUP_IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;
const PERSON_IMAGE_HEIGHT = IMAGE_WIDTH * 1.2;

interface Person {
  id: string;
  name: string;
  age: number;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  interests?: string[];
}

interface DoubleGroup {
  id: string;
  title: string;
  location: string;
  groupPhoto: string;
  person1: Person;
  person2: Person;
  groupPrompt?: {
    question: string;
    answer: string;
  };
}

interface HingeDoubleCardProps {
  group: DoubleGroup;
  onLike?: () => void;
  onMessage?: () => void;
  onPersonPress?: (person: Person) => void;
}

export default function HingeDoubleCard({
  group,
  onLike,
  onMessage,
  onPersonPress,
}: HingeDoubleCardProps) {
  const [likedElements, setLikedElements] = useState<Set<string>>(new Set());
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const handleLike = (elementId: string) => {
    const newLiked = new Set(likedElements);
    if (newLiked.has(elementId)) {
      newLiked.delete(elementId);
    } else {
      newLiked.add(elementId);
    }
    setLikedElements(newLiked);

    // Animation
    if (!scaleAnims[elementId]) {
      scaleAnims[elementId] = new Animated.Value(1);
    }
    
    Animated.sequence([
      Animated.timing(scaleAnims[elementId], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[elementId], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderActionButtons = (elementId: string, showMessage = false) => (
    <View style={styles.actionButtons}>
      {showMessage && (
        <Pressable style={styles.actionButton} onPress={onMessage}>
          <MessageCircle size={24} color={Colors.textInverse} />
        </Pressable>
      )}
      <Animated.View
        style={[
          styles.actionButton,
          likedElements.has(elementId) && styles.likedButton,
          scaleAnims[elementId] && {
            transform: [{ scale: scaleAnims[elementId] }],
          },
        ]}
      >
        <Pressable onPress={() => handleLike(elementId)}>
          <Heart
            size={24}
            color={likedElements.has(elementId) ? Colors.primary : Colors.textInverse}
            fill={likedElements.has(elementId) ? Colors.primary : 'none'}
          />
        </Pressable>
      </Animated.View>
    </View>
  );

  const renderPrompt = (prompt: { question: string; answer: string }, index: number) => (
    <View key={index} style={styles.promptCard}>
      <Text style={styles.promptQuestion}>{prompt.question}</Text>
      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
    </View>
  );

  const renderPerson = (person: Person, index: number) => (
    <View key={person.id} style={styles.personSection}>
      <Pressable onPress={() => onPersonPress?.(person)}>
        <Text style={styles.personName}>
          {person.name}, {person.age}
        </Text>
      </Pressable>

      {/* Person's photos */}
      {person.photos?.slice(0, 2).map((photo, photoIndex) => (
        <View key={photoIndex} style={styles.personImageContainer}>
          <Image
            source={getImageSource(photo)}
            style={styles.personImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
          {renderActionButtons(`person-${person.id}-photo-${photoIndex}`)}
        </View>
      ))}

      {/* Person's prompts */}
      {person.prompts?.slice(0, 1).map((prompt, promptIndex) => 
        renderPrompt(prompt, promptIndex)
      )}

      {/* Interests */}
      {person.interests && (
        <View style={styles.interestsContainer}>
          {person.interests.slice(0, 3).map((interest, i) => (
            <View key={i} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <View style={styles.groupImageContainer}>
          <Image
            source={getImageSource(group.groupPhoto)}
            style={styles.groupImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.groupImageGradient}
          />
          <View style={styles.groupOverlay}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.textInverse} />
              <Text style={styles.locationText}>{group.location}</Text>
            </View>
          </View>
          {renderActionButtons('group', true)}
        </View>
      </View>

      {/* Group Prompt */}
      {group.groupPrompt && (
        <View style={styles.groupPromptSection}>
          {renderPrompt(group.groupPrompt, 0)}
        </View>
      )}

      {/* Persons */}
      {renderPerson(group.person1, 0)}
      {renderPerson(group.person2, 1)}

      {/* Bottom spacing for tab bar */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  groupHeader: {
    marginBottom: 20,
  },
  groupImageContainer: {
    height: GROUP_IMAGE_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: CARD_PADDING,
    position: 'relative',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  groupImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  groupOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
  },
  groupTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
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
    marginLeft: 6,
    opacity: 0.9,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  groupPromptSection: {
    marginHorizontal: CARD_PADDING,
    marginBottom: 30,
  },
  personSection: {
    marginBottom: 40,
  },
  personName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginHorizontal: CARD_PADDING,
    marginBottom: 16,
  },
  personImageContainer: {
    height: PERSON_IMAGE_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: CARD_PADDING,
    marginBottom: 16,
    position: 'relative',
  },
  personImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  promptCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: CARD_PADDING,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: CARD_PADDING,
    gap: 8,
  },
  interestTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
}); 