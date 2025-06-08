import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import GroupCard from '@/components/GroupCard';
import { mockGroups } from '@/data/mockData';

export default function ViewDoubleScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();

  const handleJoinGroup = async () => {
    // Mock joining a group
    await setAuthState({ inGroup: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Join a group to start matching</Text>
        <Pressable style={styles.bannerButton} onPress={handleJoinGroup}>
          <Text style={styles.bannerButtonText}>Join Now</Text>
        </Pressable>
      </View>

      <GroupCard
        group={mockGroups[0]}
        onNext={() => {}}
        isViewOnly
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  banner: {
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  bannerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  bannerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.textInverse,
  },
});