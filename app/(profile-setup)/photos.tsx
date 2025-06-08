import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Camera,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface Photo {
  id: string;
  uri: string;
}

export default function PhotosSetupScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.2, // 20% progress
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Maximum Photos', 'You can upload up to 6 photos');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const canContinue = photos.length >= 2;

  const handleContinue = () => {
    if (canContinue) {
      router.push('./prompts');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFE3ED', '#FFF0F3', '#FFE5EC']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>Step 1 of 5 • 20%</Text>
          </View>

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Add Your Photos</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.titleContainer}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.title}>Show your best self</Text>
              <Text style={styles.subtitle}>
                Add at least 2 photos to continue. Your first photo will be your main profile picture.
              </Text>
            </View>

            {/* Photo Grid */}
            <View style={styles.photoGrid}>
              {Array.from({ length: 6 }).map((_, index) => {
                const photo = photos[index];
                const isEmpty = !photo;
                const isFirst = index === 0;

                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.photoSlot,
                      isFirst && styles.mainPhotoSlot,
                      !isEmpty && styles.filledPhotoSlot,
                    ]}
                    onPress={isEmpty ? pickImage : undefined}
                    disabled={isLoading}
                  >
                    {isEmpty ? (
                      <View style={styles.emptyPhotoContent}>
                        <Plus size={24} color={Colors.textLight} />
                        {isFirst && <Text style={styles.mainPhotoLabel}>Main</Text>}
                      </View>
                    ) : (
                      <>
                        <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => removePhoto(photo.id)}
                        >
                          <X size={16} color="#fff" />
                        </Pressable>
                        {isFirst && (
                          <View style={styles.mainPhotoBadge}>
                            <Text style={styles.mainPhotoBadgeText}>Main</Text>
                          </View>
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Tips */}
            <BlurView intensity={20} tint="light" style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Photo Tips</Text>
              <Text style={styles.tipsText}>
                • Use recent photos that clearly show your face{'\n'}
                • Smile and look confident{'\n'}
                • Include variety: close-ups and full body{'\n'}
                • Avoid group photos or sunglasses
              </Text>
            </BlurView>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <Pressable
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
            >
              <LinearGradient
                colors={canContinue ? [Colors.primary, '#E75480'] : ['#ccc', '#aaa']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {canContinue && <Check size={20} color="#fff" style={styles.continueButtonIcon} />}
                <Text style={styles.continueButtonText}>
                  {canContinue ? 'Continue' : `Add ${2 - photos.length} more photo${2 - photos.length === 1 ? '' : 's'}`}
                </Text>
                {canContinue && <ArrowRight size={20} color="#fff" style={styles.continueButtonIcon} />}
              </LinearGradient>
            </Pressable>
            
            <Text style={styles.photoCount}>
              {photos.length} of 6 photos added
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE3ED',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  photoSlot: {
    width: (width - 60) / 3,
    height: (width - 60) / 3 * 1.25,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  mainPhotoSlot: {
    width: (width - 50) / 2,
    height: (width - 50) / 2 * 1.25,
    borderColor: Colors.primary,
    borderStyle: 'solid',
  },
  filledPhotoSlot: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
  },
  emptyPhotoContent: {
    alignItems: 'center',
  },
  mainPhotoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainPhotoBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#fff',
  },
  tipsContainer: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tipsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    marginHorizontal: 8,
  },
  continueButtonIcon: {
    marginHorizontal: 4,
  },
  photoCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
}); 