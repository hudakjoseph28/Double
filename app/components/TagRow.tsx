import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import Colors from '@/constants/Colors';

// TagRow expects tags: [{ label, value, icon }]
export default function TagRow({ tags, horizontal = true }: {
  tags: { label: string; value: string; icon?: React.ReactNode }[];
  horizontal?: boolean;
}) {
  if (!tags?.length) return null;

  const renderTag = (tag: any, idx: number) => {
    // Animation: scale on press
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    return (
      <Pressable
        key={idx}
        onPressIn={() => { scale.value = withSpring(0.93); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={({ pressed }) => [styles.chipPressable, pressed && { opacity: 0.85 }]}
      >
        <Animated.View style={[styles.chip, animatedStyle]}>
          <BlurView intensity={30} tint="light" style={styles.chipBlur}>
            {tag.icon && <View style={styles.chipIcon}>{tag.icon}</View>}
            <Text style={styles.chipText}>{tag.value}</Text>
          </BlurView>
        </Animated.View>
      </Pressable>
    );
  };

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {tags.map(renderTag)}
      </ScrollView>
    );
  }
  // Grid fallback
  return <View style={[styles.row, { flexWrap: 'wrap' }]}>{tags.map(renderTag)}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chipPressable: {
    borderRadius: 16,
    marginRight: 4,
    marginBottom: 6,
  },
  chip: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 2 : 1,
  },
  chipBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 2,
  },
}); 