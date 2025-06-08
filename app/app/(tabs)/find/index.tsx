import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Search, User, MapPin, UserPlus, X, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import UserService, { User as UserType } from '@/services/UserService';
import UserProfileViewer from '@/components/UserProfileViewer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SearchResult extends UserType {
  profilePhoto?: string;
  age?: string;
  hometown?: string;
  promptPreview?: string;
}

export default function FindScreen() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus search input when screen loads
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const userService = UserService.getInstance();
      const allUsers = await userService.getAllUsers();
      
      // Filter users by username or display name (case insensitive)
      const filteredUsers = allUsers.filter(user => {
        if (currentUser && user.userId === currentUser.userId) {
          return false; // Don't show current user in results
        }
        
        const searchTerm = query.toLowerCase();
        return (
          user.username.toLowerCase().includes(searchTerm) ||
          user.displayName.toLowerCase().includes(searchTerm)
        );
      });

      // Enhance results with profile data
      const enhancedResults: SearchResult[] = [];
      
      for (const user of filteredUsers) {
        try {
          const profileDataStr = await AsyncStorage.getItem(`@profile_data_${user.userId}`);
          let profileData = null;
          
          if (profileDataStr) {
            profileData = JSON.parse(profileDataStr);
          }
          
          const enhancedUser: SearchResult = {
            ...user,
            profilePhoto: profileData?.photos?.[0] || undefined,
            age: profileData?.age || undefined,
            hometown: profileData?.hometown || undefined,
            promptPreview: profileData?.prompts?.[0]?.answer || undefined,
          };
          
          enhancedResults.push(enhancedUser);
        } catch (error) {
          // If profile data fails to load, still include the basic user
          enhancedResults.push(user);
        }
      }

      setSearchResults(enhancedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: UserType) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.resultCard}>
      <Pressable
        style={styles.resultContent}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.resultImageContainer}>
          {item.profilePhoto ? (
            <Image source={{ uri: item.profilePhoto }} style={styles.resultImage} />
          ) : (
            <View style={styles.resultImagePlaceholder}>
              <User size={24} color={Colors.textLight} />
            </View>
          )}
        </View>
        
        <View style={styles.resultInfo}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultName}>{item.displayName}</Text>
            {item.age && (
              <Text style={styles.resultAge}>{item.age}</Text>
            )}
          </View>
          
          <Text style={styles.resultUsername}>@{item.username}</Text>
          
          {item.hometown && (
            <View style={styles.resultLocation}>
              <MapPin size={12} color={Colors.textLight} />
              <Text style={styles.resultLocationText}>{item.hometown}</Text>
            </View>
          )}
          
          {item.promptPreview && (
            <Text style={styles.resultPrompt} numberOfLines={2}>
              "{item.promptPreview}"
            </Text>
          )}
        </View>
        
        <View style={styles.resultAction}>
          <UserPlus size={20} color={Colors.primary} />
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyStateText}>Searching...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Search size={48} color={Colors.textLight} />
          <Text style={styles.emptyStateTitle}>Find Your Perfect Match</Text>
          <Text style={styles.emptyStateText}>
            Search for users by username or name to send group invites
          </Text>
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <Animated.View entering={FadeIn} style={styles.emptyState}>
          <AlertCircle size={48} color={Colors.textLight} />
          <Text style={styles.emptyStateTitle}>User not found</Text>
          <Text style={styles.emptyStateText}>
            Try checking the spelling or username. Make sure the user exists and has completed their profile.
          </Text>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Users</Text>
          <Text style={styles.headerSubtitle}>Search and invite people to your group</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} tint="light" style={styles.searchBlur} />
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search by username or name..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
                style={styles.clearButton}
              >
                <X size={16} color={Colors.textLight} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.userId}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedUser && (
          <UserProfileViewer
            user={selectedUser}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resultImageContainer: {
    marginRight: 12,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  resultImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  resultName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  resultAge: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textLight,
  },
  resultUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  resultLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  resultLocationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textLight,
  },
  resultPrompt: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  resultAction: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});