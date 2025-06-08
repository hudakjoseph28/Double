import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronDown, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterBarProps {
  onFilterChange: (type: string, value: any) => void;
}

const ageOptions: FilterOption[] = [
  { label: '18-24', value: '18-24' },
  { label: '25-30', value: '25-30' },
  { label: '31-40', value: '31-40' },
  { label: '41+', value: '41+' },
];

const locationOptions: FilterOption[] = [
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 25 miles', value: 25 },
  { label: 'Within 50 miles', value: 50 },
];

const intentionOptions: FilterOption[] = [
  { label: 'Long-term Dating', value: 'long-term' },
  { label: 'Short-term Dating', value: 'short-term' },
  { label: 'Making Friends', value: 'friends' },
  { label: 'Not Sure Yet', value: 'unsure' },
];

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    age: null,
    location: null,
    intention: null,
  });

  const handleFilterPress = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const handleOptionSelect = (type: string, option: FilterOption) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: option,
    }));
    onFilterChange(type, option.value);
    setActiveFilter(null);
  };

  const renderFilterOptions = (type: string) => {
    let options: FilterOption[] = [];
    switch (type) {
      case 'age':
        options = ageOptions;
        break;
      case 'location':
        options = locationOptions;
        break;
      case 'intention':
        options = intentionOptions;
        break;
    }

    return (
      <Modal
        visible={activeFilter === type}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveFilter(null)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setActiveFilter(null)}
        >
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.optionsContainer}
          >
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <Pressable onPress={() => setActiveFilter(null)}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>
            {options.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  selectedFilters[type]?.value === option.value && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(type, option)}
              >
                <Text style={[
                  styles.optionText,
                  selectedFilters[type]?.value === option.value && styles.selectedOptionText,
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.filters}>
        <Pressable
          style={[styles.filterButton, selectedFilters.age && styles.activeFilter]}
          onPress={() => handleFilterPress('age')}
        >
          <Text style={styles.filterText}>
            {selectedFilters.age?.label || 'Age'}
          </Text>
          <ChevronDown size={16} color={Colors.text} />
        </Pressable>

        <Pressable
          style={[styles.filterButton, selectedFilters.location && styles.activeFilter]}
          onPress={() => handleFilterPress('location')}
        >
          <Text style={styles.filterText}>
            {selectedFilters.location?.label || 'Location'}
          </Text>
          <ChevronDown size={16} color={Colors.text} />
        </Pressable>

        <Pressable
          style={[styles.filterButton, selectedFilters.intention && styles.activeFilter]}
          onPress={() => handleFilterPress('intention')}
        >
          <Text style={styles.filterText}>
            {selectedFilters.intention?.label || 'Dating Intentions'}
          </Text>
          <ChevronDown size={16} color={Colors.text} />
        </Pressable>
      </View>

      {renderFilterOptions('age')}
      {renderFilterOptions('location')}
      {renderFilterOptions('intention')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  activeFilter: {
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  optionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
  },
  option: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
});