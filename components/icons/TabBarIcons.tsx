import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Search, MessageSquare, Heart, User } from 'lucide-react-native';

interface TabIconProps {
  color: string;
  size: number;
}

export function DoubleIcon({ color, size }: TabIconProps) {
  return (
    <View style={styles.doubleHeartContainer}>
      <Heart 
        size={size * 0.8} 
        color="#2B3F87"
        fill="none"
        strokeWidth={2.5}
      />
      <Heart 
        size={size * 0.8} 
        color={color}
        fill="none"
        strokeWidth={2.5}
        style={styles.secondHeart}
      />
    </View>
  );
}

export function FindIcon({ color, size }: TabIconProps) {
  return <Search color={color} size={size} strokeWidth={2} />;
}

export function MessagesIcon({ color, size }: TabIconProps) {
  return <MessageSquare color={color} size={size} strokeWidth={2} />;
}

export function LikesIcon({ color, size }: TabIconProps) {
  return <Heart color={color} size={size} strokeWidth={2} />;
}

export function ProfileIcon({ color, size }: TabIconProps) {
  return <User color={color} size={size} strokeWidth={2} />;
}

const styles = StyleSheet.create({
  doubleHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondHeart: {
    marginLeft: -10,
    marginTop: -1,
  },
});