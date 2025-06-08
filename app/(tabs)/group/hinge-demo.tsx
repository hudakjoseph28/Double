import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HingeDoubleCard from '@/components/HingeDoubleCard';
import Colors from '@/constants/Colors';

const sampleDoubleGroup = {
  id: '1',
  title: 'Adventure Seekers',
  location: 'Los Angeles, CA',
  groupPhoto: 'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
  person1: {
    id: 'p1',
    name: 'Emma',
    age: 28,
    photos: [
      'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg',
      'https://images.pexels.com/photos/1078345/pexels-photo-1078345.jpeg',
    ],
    prompts: [
      {
        question: 'My ideal weekend includes',
        answer: 'Hiking trails with my best friend, discovering new coffee shops, and finding the perfect sunset spot for photos.',
      },
      {
        question: 'We\'ll get along if',
        answer: 'You love adventure as much as I do and don\'t mind getting a little lost while exploring.',
      },
    ],
    interests: ['Photography', 'Hiking', 'Coffee', 'Travel'],
  },
  person2: {
    id: 'p2',
    name: 'James',
    age: 30,
    photos: [
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      'https://images.pexels.com/photos/1082962/pexels-photo-1082962.jpeg',
    ],
    prompts: [
      {
        question: 'My simple pleasures',
        answer: 'A good book, morning coffee, and the sound of waves. Sometimes the best adventures happen in quiet moments.',
      },
    ],
    interests: ['Reading', 'Surfing', 'Cooking', 'Music'],
  },
  groupPrompt: {
    question: 'Our ideal double date would be...',
    answer: 'Beach volleyball followed by a sunset dinner with good music and even better conversation.',
  },
};

export default function HingeDemoScreen() {
  const handleLike = () => {
    console.log('Group liked!');
  };

  const handleMessage = () => {
    console.log('Message sent!');
  };

  const handlePersonPress = (person: any) => {
    console.log('Person pressed:', person.name);
    // Navigate to person's full profile
  };

  return (
    <SafeAreaView style={styles.container}>
      <HingeDoubleCard
        group={sampleDoubleGroup}
        onLike={handleLike}
        onMessage={handleMessage}
        onPersonPress={handlePersonPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
}); 