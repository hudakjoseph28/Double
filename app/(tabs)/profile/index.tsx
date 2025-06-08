import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ScrollView, Image, Pressable, Dimensions, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Heart, Settings, Plus, X, ChevronDown, Upload, Camera, Trash2, Edit3 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DoubleIcon } from '@/components/icons/TabBarIcons';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const IMAGE_RADIUS = 24;
const SECTION_GAP = 20;

interface ProfileData {
  photos: string[];
  prompts: Array<{ question: string; answer: string }>;
  age: string;
  height: string;
  gender: string;
  orientation: string;
  religion: string;
  drinking: string;
  smoking: string;
  friendly420: boolean;
  monogamy: boolean;
  hometown: string;
  school: string;
  intention: string;
  // Account info from signup
  displayName: string;
  email: string;
  username: string;
  userId: string;
}

const PROMPT_OPTIONS = [
  "What's your ideal first date?",
  "What's something you're passionate about?",
  "What's your biggest goal right now?",
  "What's your love language?",
  "What's something that makes you laugh?",
  "What's your favorite way to spend a weekend?",
  "What's something you're learning?",
  "What's your biggest adventure?",
];

const DROPDOWN_OPTIONS = {
  age: Array.from({ length: 82 }, (_, i) => (i + 18).toString()),
  height: ["4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\"", "6'6\""],
  gender: ["Woman", "Man", "Non-binary", "Other"],
  orientation: ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Asexual", "Other"],
  religion: ["Christian", "Muslim", "Jewish", "Hindu", "Buddhist", "Agnostic", "Atheist", "Spiritual", "Other"],
  drinking: ["Never", "Rarely", "Socially", "Regularly"],
  smoking: ["Never", "Rarely", "Socially", "Regularly"],
  intention: ["Relationship", "Something casual", "New friends", "Still figuring it out"],
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, resetAllData, checkProfileCompletion, markProfileComplete, isProfileComplete, currentUser } = useAuth();
  const [settingsModal, setSettingsModal] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    photos: [] as string[],
    prompts: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
    age: "",
    height: "",
    gender: "",
    orientation: "",
    religion: "",
    drinking: "",
    smoking: "",
    friendly420: false,
    monogamy: true,
    hometown: "",
    school: "",
    intention: "",
    // Account info from signup
    displayName: "",
    email: "",
    username: "",
    userId: "",
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  // Animations
  const glowAnim = useSharedValue(1);
  const settingsScale = useSharedValue(1);

  useEffect(() => {
    loadProfileData();
    
    const interval = setInterval(() => {
      glowAnim.value = withSpring(1.06, { damping: 10 });
      setTimeout(() => { glowAnim.value = withSpring(1, { damping: 10 }); }, 800);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Reload profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  // Check completion whenever profile data changes
  useEffect(() => {
    const validateCompletion = async () => {
      const isComplete = await checkProfileCompletion();
      if (isComplete && !isProfileComplete) {
        await markProfileComplete();
        setShowCompletionBanner(false);
      }
    };
    
    validateCompletion();
  }, [profileData]);

  const loadProfileData = async () => {
    try {
      // Use consistent key format with userId
      const profileKey = currentUser?.userId ? `@profile_data_${currentUser.userId}` : '@profile_data';
      const saved = await AsyncStorage.getItem(profileKey);
      let profileData: ProfileData = {
        photos: [] as string[],
        prompts: [
          { question: "", answer: "" },
          { question: "", answer: "" },
          { question: "", answer: "" },
        ],
        age: "",
        height: "",
        gender: "",
        orientation: "",
        religion: "",
        drinking: "",
        smoking: "",
        friendly420: false,
        monogamy: true,
        hometown: "",
        school: "",
        intention: "",
        // Account info from current user
        displayName: currentUser?.displayName || "",
        email: currentUser?.email || "",
        username: currentUser?.username || "",
        userId: currentUser?.userId || "",
      };

      if (saved) {
        const savedData = JSON.parse(saved);
        profileData = { ...profileData, ...savedData };
        
        // Always use current user data for account info
        profileData.displayName = currentUser?.displayName || "";
        profileData.email = currentUser?.email || "";
        profileData.username = currentUser?.username || "";
        profileData.userId = currentUser?.userId || "";
      } else if (currentUser?.userId === 'DD000001') {
        // Add default photos and data for the main user account
        profileData = {
          ...profileData,
          photos: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face'
          ],
          age: "28",
          height: "5'10\"",
          gender: "Male",
          orientation: "Straight",
          religion: "Agnostic",
          drinking: "Socially",
          smoking: "Never",
          friendly420: false,
          monogamy: true,
          hometown: "San Francisco, CA",
          school: "UC Berkeley",
          intention: "Long-term relationship",
          prompts: [
            { question: "My ideal Sunday", answer: "Exploring new neighborhoods with coffee and good company" },
            { question: "I'm looking for", answer: "Someone who shares my love for adventure and meaningful conversations" },
            { question: "My simple pleasures", answer: "Morning coffee, sunset walks, and discovering new music" },
          ],
        };
        // Save the default data
        await AsyncStorage.setItem(profileKey, JSON.stringify(profileData));
      }

      setProfileData(profileData);
    } catch (error) {
      console.warn('⚠️ Error loading profile data:', error);
    }
  };

  const saveProfileData = async (data: ProfileData) => {
    try {
      // Use consistent key format with userId
      const profileKey = currentUser?.userId ? `@profile_data_${currentUser.userId}` : '@profile_data';
      await AsyncStorage.setItem(profileKey, JSON.stringify(data));
      setProfileData(data);
    } catch (error) {
      console.warn('⚠️ Error saving profile data:', error);
    }
  };

  const updateProfileField = (field: keyof ProfileData, value: any) => {
    const newData = { ...profileData, [field]: value };
    saveProfileData(newData);
  };

  // Calculate completion progress
  const getCompletionProgress = () => {
    const requirements = [
      profileData.photos.length >= 2,
      profileData.prompts.every(p => p.question && p.answer),
      !!profileData.age,
      !!profileData.height,
      !!profileData.gender,
      !!profileData.orientation,
      !!profileData.hometown,
      !!profileData.school,
      !!profileData.intention,
      typeof profileData.monogamy === 'boolean',
    ];
    
    const completed = requirements.filter(Boolean).length;
    return { completed, total: requirements.length, percentage: (completed / requirements.length) * 100 };
  };

  // Completion banner
  const renderCompletionBanner = () => {
    if (!showCompletionBanner || isProfileComplete) return null;
    
    const progress = getCompletionProgress();

  return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.completionBanner}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Complete your profile to unlock the full app experience</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress.completed}/{progress.total} completed</Text>
          </View>
        </View>
        <Pressable 
          style={styles.bannerClose}
          onPress={() => setShowCompletionBanner(false)}
        >
          <X size={16} color={Colors.textLight} />
        </Pressable>
      </Animated.View>
    );
  };

  // Clean header with settings
  const renderHeader = () => {
    const logoGlow = useAnimatedStyle(() => ({
      transform: [{ scale: glowAnim.value }],
    }));

    const settingsAnim = useAnimatedStyle(() => ({
      transform: [{ scale: settingsScale.value }],
    }));

    return (
      <Animated.View style={[styles.logoHeader, logoGlow]}>
        <View style={styles.logoContainer}>
          <DoubleIcon color={Colors.primary} size={28} />
          <Text style={styles.logoText}>
            <Text style={{ color: '#2B3F87' }}>{profileData.displayName || 'My'} </Text>
            <Text style={{ color: Colors.primary }}>Profile</Text>
          </Text>
        </View>
        <Animated.View style={[styles.settingsButton, settingsAnim]}>
          <Pressable
            onPress={() => {
              settingsScale.value = withSpring(0.9, { damping: 8 });
              setTimeout(() => { settingsScale.value = withSpring(1); }, 120);
              setSettingsModal(true);
            }}
          >
            <Settings size={24} color={Colors.primary} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  // Photo upload grid
  const renderPhotoUpload = () => {
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && profileData.photos.length < 6) {
        const newPhotos = [...profileData.photos, result.assets[0].uri];
        updateProfileField('photos', newPhotos);
      }
    };

    const removePhoto = (index: number) => {
      const newPhotos = profileData.photos.filter((_, i) => i !== index);
      updateProfileField('photos', newPhotos);
    };

    return (
      <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.photoSlot}>
              {profileData.photos[index] ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: profileData.photos[index] }} style={styles.photo} />
                  <Pressable
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.addPhotoButton} onPress={pickImage}>
                  <Plus size={24} color={Colors.textLight} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Prompt selection
  const renderPrompts = () => {
    const updatePrompt = (index: number, field: 'question' | 'answer', value: string) => {
      const newPrompts = [...profileData.prompts];
      newPrompts[index] = { ...newPrompts[index], [field]: value };
      updateProfileField('prompts', newPrompts);
    };

    return (
      <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.promptSection}>
        <Text style={styles.sectionTitle}>Prompts</Text>
        {profileData.prompts.map((prompt, index) => (
          <View key={index} style={styles.promptCard}>
            <Text style={styles.promptLabel}>PROMPT {index + 1}</Text>
            
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setActivePrompt(activePrompt === index ? null : index)}
            >
              <Text style={styles.dropdownText}>
                {prompt.question || "Select a prompt..."}
              </Text>
              <ChevronDown size={20} color={Colors.textLight} />
            </Pressable>

            {activePrompt === index && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {PROMPT_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.dropdownOption}
                      onPress={() => {
                        updatePrompt(index, 'question', option);
                        setActivePrompt(null);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {prompt.question && (
              <TextInput
                style={styles.promptAnswer}
                placeholder="Your answer..."
                placeholderTextColor={Colors.textLight}
                value={prompt.answer}
                onChangeText={(text) => updatePrompt(index, 'answer', text)}
                multiline
              />
            )}
          </View>
        ))}
      </Animated.View>
    );
  };

  // Profile info form
  const renderProfileForm = () => {
    const renderDropdown = (field: keyof ProfileData, label: string, options: string[]) => (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Pressable
          style={styles.dropdownButton}
          onPress={() => setActiveDropdown(activeDropdown === field ? null : field)}
        >
          <Text style={[styles.dropdownText, !profileData[field] && styles.placeholderText]}>
            {(profileData[field] as string) || `Select ${label.toLowerCase()}...`}
          </Text>
          <ChevronDown size={20} color={Colors.textLight} />
        </Pressable>

        {activeDropdown === field && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => {
                    updateProfileField(field, option);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
              )}
            </View>
    );

    const renderToggle = (field: keyof ProfileData, label: string) => (
      <View style={styles.formField}>
        <View style={styles.toggleRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Pressable
            style={[styles.toggle, profileData[field] && styles.toggleActive]}
            onPress={() => updateProfileField(field, !profileData[field])}
          >
            <View style={[styles.toggleThumb, profileData[field] && styles.toggleThumbActive]} />
          </Pressable>
        </View>
      </View>
    );

    const renderTextInput = (field: keyof ProfileData, label: string, placeholder: string) => (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={profileData[field] as string}
          onChangeText={(text) => updateProfileField(field, text)}
        />
      </View>
    );

    return (
      <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.formSection}>
        <Text style={styles.sectionTitle}>About You</Text>
        
        {renderDropdown('age', 'Age', DROPDOWN_OPTIONS.age)}
        {renderDropdown('height', 'Height', DROPDOWN_OPTIONS.height)}
        {renderDropdown('gender', 'Gender', DROPDOWN_OPTIONS.gender)}
        {renderDropdown('orientation', 'Orientation', DROPDOWN_OPTIONS.orientation)}
        {renderDropdown('religion', 'Religion', DROPDOWN_OPTIONS.religion)}
        {renderDropdown('drinking', 'Drinking', DROPDOWN_OPTIONS.drinking)}
        {renderDropdown('smoking', 'Smoking', DROPDOWN_OPTIONS.smoking)}
        {renderToggle('friendly420', '420 Friendly')}
        {renderToggle('monogamy', 'Monogamous')}
        {renderTextInput('hometown', 'Hometown', 'Where are you from?')}
        {renderTextInput('school', 'School', 'Where did you study?')}
        {renderDropdown('intention', 'Looking for', DROPDOWN_OPTIONS.intention)}
      </Animated.View>
    );
  };

  // Account info section
  const renderAccountInfo = () => (
    <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.accountSection}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Display Name</Text>
          <Text style={styles.accountValue}>{profileData.displayName}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Username</Text>
          <Text style={styles.accountValue}>@{profileData.username}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Email</Text>
          <Text style={styles.accountValue}>{profileData.email}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>User ID</Text>
          <Text style={styles.accountValue}>{profileData.userId}</Text>
        </View>
      </View>
    </Animated.View>
  );

  // Settings modal
  const renderSettingsModal = () => (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      style={styles.modalOverlay}
    >
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View entering={ZoomIn.duration(300)} exiting={ZoomOut.duration(300)} style={styles.modalCard}>
        <Text style={styles.modalTitle}>Settings</Text>
        
        <Pressable style={styles.settingsOption}>
          <Text style={styles.settingsOptionText}>Pause Account</Text>
          <View style={styles.toggle}>
            <View style={styles.toggleThumb} />
          </View>
        </Pressable>
        
        <Pressable style={styles.settingsOption}>
          <Edit3 size={20} color={Colors.primary} />
          <Text style={styles.settingsOptionText}>Edit Email & Password</Text>
        </Pressable>
        
        <Pressable 
          style={styles.settingsOption}
          onPress={() => {
            setSettingsModal(false);
            logout();
          }}
        >
          <Text style={styles.settingsOptionText}>Log Out</Text>
        </Pressable>
        
        {/* Temporary Reset Button for Testing */}
        <Pressable 
          style={[styles.settingsOption, { backgroundColor: 'rgba(255, 165, 0, 0.1)' }]}
          onPress={() => {
            Alert.alert(
              'Reset All Data (Testing)',
              'This will clear all users and data. Use this to test the full signup flow from scratch.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset All', 
                  style: 'destructive',
                  onPress: async () => {
                    setSettingsModal(false);
                    await resetAllData();
                  }
                },
              ]
            );
          }}
        >
          <Text style={[styles.settingsOptionText, { color: '#ff8800' }]}>🔄 Reset All Data (Testing)</Text>
        </Pressable>
        
        {/* Create Sample Users for Testing */}
        <Pressable 
          style={[styles.settingsOption, { backgroundColor: 'rgba(0, 150, 255, 0.1)' }]}
          onPress={async () => {
            try {
              const UserService = (await import('@/services/UserService')).default;
              const userService = UserService.getInstance();
              await userService.createSampleUsers();
              Alert.alert('Success', 'Sample users created! You can now test the search functionality in the Find tab.');
              setSettingsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to create sample users');
            }
          }}
        >
          <Text style={[styles.settingsOptionText, { color: '#0096ff' }]}>👥 Create Sample Users (Testing)</Text>
        </Pressable>
        
        {/* Create 30 Bot Users for Testing */}
        <Pressable 
          style={[styles.settingsOption, { backgroundColor: 'rgba(0, 200, 100, 0.1)' }]}
          onPress={async () => {
            try {
              const UserService = (await import('@/services/UserService')).default;
              const userService = UserService.getInstance();
              await userService.create30BotUsers();
              Alert.alert('Success', '30 bot users created with complete profiles! Perfect for testing groups, search, and login flows.');
              setSettingsModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to create bot users');
            }
          }}
        >
          <Text style={[styles.settingsOptionText, { color: '#00c864' }]}>🤖 Create 30 Bot Users (Testing)</Text>
        </Pressable>
        
        {/* Show Bot Credentials for Testing */}
        <Pressable 
          style={[styles.settingsOption, { backgroundColor: 'rgba(150, 0, 255, 0.1)' }]}
          onPress={async () => {
            try {
              const UserService = (await import('@/services/UserService')).default;
              const userService = UserService.getInstance();
              const credentials = await userService.getBotUserCredentials();
              
              if (credentials.length === 0) {
                Alert.alert('No Bot Users', 'No bot users found. Create them first using the option above.');
                return;
              }
              
              const credentialsList = credentials.slice(0, 10).map(cred => 
                `${cred.displayName}\nEmail: ${cred.email}\nPassword: ${cred.password}\n`
              ).join('\n');
              
              Alert.alert(
                'Bot User Credentials (First 10)',
                `You can log in as any of these users:\n\n${credentialsList}\nAll passwords follow pattern: pw01, pw02, etc.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to get bot credentials');
            }
          }}
        >
          <Text style={[styles.settingsOptionText, { color: '#9600ff' }]}>🔑 Show Bot Credentials (Testing)</Text>
        </Pressable>
        
        {/* Debug Bot Users Status */}
        <Pressable 
          style={[styles.settingsOption, { backgroundColor: 'rgba(255, 140, 0, 0.1)' }]}
          onPress={async () => {
            try {
              const UserService = (await import('@/services/UserService')).default;
              const userService = UserService.getInstance();
              const debug = await userService.debugBotUsers();
              
              const sampleList = debug.sampleBots.map(bot => 
                `${bot.displayName} (@${bot.username})\nProfile: ${bot.isProfileComplete ? '✅' : '❌'}`
              ).join('\n\n');
              
              Alert.alert(
                'Bot Users Debug Info',
                `Total Users: ${debug.totalUsers}\nBot Users: ${debug.botUsers}\n\nSample Bots:\n${sampleList}`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to get debug info');
            }
          }}
        >
          <Text style={[styles.settingsOptionText, { color: '#ff8c00' }]}>🔍 Debug Bot Users Status</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.settingsOption, styles.dangerOption]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    setSettingsModal(false);
                    logout();
                  }
                },
              ]
            );
          }}
        >
          <Trash2 size={20} color="#ff4444" />
          <Text style={[styles.settingsOptionText, styles.dangerText]}>Delete Account</Text>
        </Pressable>
        
        <Pressable 
          style={styles.closeButton}
          onPress={() => setSettingsModal(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </Animated.View>
        </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {renderHeader()}
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {renderAccountInfo()}
          {renderPhotoUpload()}
          {renderPrompts()}
          {renderProfileForm()}
      </ScrollView>

        {settingsModal && renderSettingsModal()}
        {renderCompletionBanner()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    zIndex: 20,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#E75480',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    letterSpacing: 0.3,
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: SECTION_GAP,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  photoSection: {
    width: '100%',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  photoSlot: {
    width: (width - 48) / 3,
    aspectRatio: 0.75,
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: IMAGE_RADIUS,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: IMAGE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
  },
  promptSection: {
    width: '100%',
    alignItems: 'center',
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  promptLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,247,250,0.9)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  dropdownText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 14,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  dropdownOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text,
  },
  promptAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text,
    backgroundColor: 'rgba(247,247,250,0.9)',
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formSection: {
    width: '100%',
    alignItems: 'center',
  },
  formField: {
    width: '100%',
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: Colors.divider,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 12,
  },
  settingsOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  dangerOption: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  dangerText: {
    color: '#ff4444',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: '#fff',
  },
  completionBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  bannerContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  bannerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text,
  },
  bannerClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
  },
  accountSection: {
    width: '100%',
    alignItems: 'center',
  },
  accountCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    width: '100%',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accountLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  accountValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.text,
  },
});