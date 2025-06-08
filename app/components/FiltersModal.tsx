import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FiltersModal({ visible, onClose }: FiltersModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Distance</Text>
            {/* Add distance slider here */}

            <Text style={styles.sectionTitle}>Age Range</Text>
            {/* Add age range slider here */}

            <Text style={styles.sectionTitle}>Interests</Text>
            {/* Add interests selection here */}
          </View>

          <Pressable style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 