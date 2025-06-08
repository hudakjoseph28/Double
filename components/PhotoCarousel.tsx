import React, { useState } from 'react';
import { StyleSheet, View, Image, Dimensions, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Colors from '@/constants/Colors';
import { getImageSource } from '@/data/mockUsers';

const { width } = Dimensions.get('window');

interface PhotoCarouselProps {
  images: string[];
  onPress?: () => void;
}

export default function PhotoCarousel({ images, onPress }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const direction = event.velocityX > 0 ? -1 : 1;
      const nextIndex = Math.max(0, Math.min(images.length - 1, activeIndex + direction));
      
      if (nextIndex !== activeIndex) {
        translateX.value = withSpring(-nextIndex * width);
        setActiveIndex(nextIndex);
      } else {
        translateX.value = withSpring(-activeIndex * width);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  const onDotPress = (index: number) => {
    setActiveIndex(index);
    translateX.value = withSpring(-index * width);
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.imagesContainer, animatedStyle]}>
          {images.map((image, index) => (
            <Pressable key={`image-${index}`} style={styles.imageWrapper} onPress={onPress}>
              <Image
                source={getImageSource(image)}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </Animated.View>
      </GestureDetector>
      
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <Pressable
            key={`dot-${index}`}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
            onPress={() => onDotPress(index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    overflow: 'hidden',
  },
  imagesContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  imageWrapper: {
    width,
    height: 400,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});