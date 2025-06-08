import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Heart, Book, GraduationCap, Rainbow, Cross, Users, MapPin, Star, Smile, GlassWater, Cigarette, Handshake } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Tag icon mapping
const tagIcons: { [key: string]: React.ReactNode } = {
  Religion: <Cross size={16} color={Colors.primary} />,
  Gender: <Rainbow size={16} color={Colors.primary} />,
  School: <GraduationCap size={16} color={Colors.primary} />,
  Intention: <Handshake size={16} color={Colors.primary} />,
  Smoke: <Cigarette size={16} color={Colors.primary} />,
  Drink: <GlassWater size={16} color={Colors.primary} />,
  Vibe: <Smile size={16} color={Colors.primary} />,
  Location: <MapPin size={16} color={Colors.primary} />,
  Default: <Star size={16} color={Colors.primary} />,
};

// Example: tags = [{ label: 'Religion', value: 'Catholic' }, ...]
function TagChip({ label, value }: { label: string; value: string }) {
  return (
    <BlurView intensity={30} tint="light" style={styles.tagChip}>
      {tagIcons[label] || tagIcons.Default}
      <Text style={styles.tagText}>{value}</Text>
    </BlurView>
  );
}

export default function UserCard({ user, alt }: { user: any; alt?: boolean }) {
  const router = useRouter();
  // Example tag data (replace with real user fields as needed)
  const tags = [
    user.religion && { label: 'Religion', value: user.religion },
    user.gender && { label: 'Gender', value: user.gender },
    user.school && { label: 'School', value: user.school },
    user.intention && { label: 'Intention', value: user.intention },
    user.smoke && { label: 'Smoke', value: user.smoke },
    user.drink && { label: 'Drink', value: user.drink },
    user.vibe && { label: 'Vibe', value: user.vibe },
    user.location && { label: 'Location', value: user.location },
  ].filter(Boolean);

  return (
    <View style={[styles.card, alt && styles.cardAlt]}>
      <View style={styles.nameInfoBlock}>
        <Pressable onPress={() => router.push(`/profile/${user.id}`)}>
          <Text style={[styles.name, { color: alt ? Colors.primary : '#E75480' }]}>{user.name}</Text>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsRow}>
          {tags.map((tag, idx) => (
            <TagChip key={idx} label={tag.label} value={tag.value} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.photosRow}>
        {user.photos.slice(0, 2).map((photo: string, idx: number) => (
          <Pressable
            key={photo}
            style={[styles.photoWrapper, idx === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
            onPress={() => router.push(`/profile/${user.id}`)}
          >
            <Image source={{ uri: photo }} style={styles.photo} />
          </Pressable>
        ))}
      </View>
      {user.prompts && user.prompts[0] && (
        <View style={styles.promptPill}>
          <Text style={styles.promptText}>
            "{user.prompts[0].answer || 'Not provided'}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    marginHorizontal: 18,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 28,
    gap: 14,
  },
  cardAlt: {
    backgroundColor: '#f7f7fa',
  },
  nameInfoBlock: {
    marginBottom: 8,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 19,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 4,
  },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  photoWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
  },
  photo: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 18,
  },
  promptPill: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
    marginTop: 10,
  },
  promptText: {
    fontFamily: 'Merriweather-Italic',
    fontSize: 15,
    color: Colors.text,
    fontStyle: 'italic',
    opacity: 0.85,
    textAlign: 'center',
  },
}); 