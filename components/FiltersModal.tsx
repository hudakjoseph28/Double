import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

const FilterSection = ({ title, options, selectedValue, onSelect }) => (
  <Animated.View 
    entering={FadeIn.duration(400).delay(200)}
    style={styles.section}
  >
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.optionsGrid}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.optionButton,
            selectedValue === option.value && styles.selectedOption
          ]}
          onPress={() => onSelect(option.value)}
        >
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <Text style={[
            styles.optionText,
            selectedValue === option.value && styles.selectedOptionText
          ]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </Animated.View>
);

export default function FiltersModal({ visible, onClose }: FiltersModalProps) {
  const [preferences, setPreferences] = React.useState({
    ageRange: '25-35',
    distance: '10mi',
    gender: 'all',
    intention: 'dating'
  });

  const ageRanges = [
    { label: '18-24', value: '18-24' },
    { label: '25-35', value: '25-35' },
    { label: '35-45', value: '35-45' },
    { label: '45+', value: '45+' }
  ];

  const distances = [
    { label: '5 mi', value: '5mi' },
    { label: '10 mi', value: '10mi' },
    { label: '25 mi', value: '25mi' },
    { label: '50+ mi', value: '50mi' }
  ];

  const genders = [
    { label: 'All', value: 'all' },
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Non-binary', value: 'nonbinary' }
  ];

  const intentions = [
    { label: 'Dating', value: 'dating' },
    { label: 'Relationship', value: 'relationship' },
    { label: 'Casual', value: 'casual' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={styles.modalContainer}
      >
        <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
        
        <View style={styles.modalContent}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <FilterSection
              title="Age Range"
              options={ageRanges}
              selectedValue={preferences.ageRange}
              onSelect={(value) => setPreferences(prev => ({ ...prev, ageRange: value }))}
            />

            <FilterSection
              title="Distance"
              options={distances}
              selectedValue={preferences.distance}
              onSelect={(value) => setPreferences(prev => ({ ...prev, distance: value }))}
            />

            <FilterSection
              title="Show Me"
              options={genders}
              selectedValue={preferences.gender}
              onSelect={(value) => setPreferences(prev => ({ ...prev, gender: value }))}
            />

            <FilterSection
              title="Looking For"
              options={intentions}
              selectedValue={preferences.intention}
              onSelect={(value) => setPreferences(prev => ({ ...prev, intention: value }))}
            />

            <Pressable style={styles.applyButton} onPress={onClose}>
              <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
  },
  selectedOption: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.textInverse,
  },
});