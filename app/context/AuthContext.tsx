// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService, { User, CreateAccountData } from '@/services/UserService';
import GroupService from '@/services/GroupService';
import ToastService from '@/services/ToastService';
import { APP_STORE_MODE, DEFAULT_REMEMBER_ME, GUEST_ACCOUNTS } from '@/constants/DevSettings';

interface AuthState {
  isSignedIn: boolean;
  inGroup: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  isProfileComplete: boolean;
  currentUser: User | null;
}

interface AuthContextType extends AuthState {
  loading: boolean;
  justLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  createAccount: (data: CreateAccountData) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  resetAllData: () => Promise<void>;
  setJustLoggedIn: (value: boolean) => void;
  checkProfileCompletion: () => Promise<boolean>;
  markProfileComplete: () => Promise<void>;
  updateUserData: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isSignedIn: false,
    inGroup: false,
    userId: null,
    username: null,
    email: null,
    isProfileComplete: false,
    currentUser: null,
  });
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const userService = UserService.getInstance();
  const groupService = GroupService.getInstance();
  const toastService = ToastService.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      
      // Initialize UserService and GroupService
      await userService.initialize();
      await groupService.initialize();

      // DEV MODE: Check if we should force fresh login for testing
      const forceLogin = await AsyncStorage.getItem('@force_fresh_login');
      if (forceLogin === 'true') {
        await AsyncStorage.multiRemove(['@user_data', '@remembered_session', '@force_fresh_login']);
        setState({
          isSignedIn: false,
          inGroup: false,
          userId: null,
          username: null,
          email: null,
          isProfileComplete: false,
          currentUser: null,
        });
        setLoading(false);
        return;
      }

      // TEMPORARY: Force fresh login for testing - comment out auto-login
      await AsyncStorage.multiRemove(['@user_data', '@remembered_session']);
      setState({
        isSignedIn: false,
        inGroup: false,
        userId: null,
        username: null,
        email: null,
        isProfileComplete: false,
        currentUser: null,
      });
      setLoading(false);
      return;

      /*
      // SCENARIO 3: Check for "Remember Me" session first
      const rememberedSession = await AsyncStorage.getItem('@remembered_session');
      
      if (rememberedSession) {
        const { userId, timestamp } = JSON.parse(rememberedSession);
        
        // Check if session is still valid (optional: add expiration logic)
        const sessionAge = Date.now() - timestamp;
        const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        if (sessionAge < maxSessionAge) {
          const user = await userService.getUserById(userId);
          
          if (user && user.rememberMe) {
            await setUserState(user);
            setJustLoggedIn(true); // Set flag for proper navigation
            setLoading(false);
            return;
          }
        }
        
        // Clear expired or invalid session
        await AsyncStorage.removeItem('@remembered_session');
      }

      // Check for current user data (from recent login)
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          await setUserState(user);
          setJustLoggedIn(false); // Don't trigger navigation since user is already logged in
          setLoading(false);
          return;
        } catch (error) {
          // Clear invalid user data
          await AsyncStorage.removeItem('@user_data');
        }
      }

      // SCENARIO 1 & 2: Default to logged out state (show login screen)
      setState({
        isSignedIn: false,
        inGroup: false,
        userId: null,
        username: null,
        email: null,
        isProfileComplete: false,
        currentUser: null,
      });
      */
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const setUserState = async (user: User) => {
    const newState: AuthState = {
      isSignedIn: true,
      inGroup: user.inGroup,
      userId: user.userId,
      username: user.username,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
      currentUser: user,
    };

    setState(newState);

    // Save session if remember me is enabled
    if (user.rememberMe) {
      await AsyncStorage.setItem('@remembered_session', JSON.stringify({
        userId: user.userId,
        timestamp: Date.now(),
      }));
    }

  };

  const createAccount = async (data: CreateAccountData) => {
    
    try {
      // Validate input
      if (!UserService.validateEmail(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = UserService.validatePassword(data.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      const usernameValidation = UserService.validateUsername(data.username);
      if (!usernameValidation.valid) {
        throw new Error(usernameValidation.message);
      }

      if (!data.displayName.trim()) {
        throw new Error('Please enter your display name');
      }

      // Create account
      const result = await userService.createAccount(data);
      
      if (!result.success || !result.user) {
        throw new Error(result.error || 'Failed to create account');
      }

      // SCENARIO 1: Auto-login after account creation and redirect to profile setup
      await setUserState(result.user);
      setJustLoggedIn(true);

      toastService.success(`Welcome to Double, ${result.user.displayName}!`, 'Account Created');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toastService.error(message, 'Account Creation Failed');
      throw error;
    }
  };

  // Demo account credentials
  const DEMO_CREDENTIALS = {
    email: 'demo@doubledate.com',
    password: 'demo123',
    userId: 'DEMO001',
    displayName: 'Joey',
    firstName: 'Joey',
    lastName: 'Demo'
  };

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      
      setLoading(true);
      
      
      // Check for demo account first
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        
        // Create demo user profile
        const demoUser: User = {
          userId: DEMO_CREDENTIALS.userId,
          email: DEMO_CREDENTIALS.email,
          username: 'demo_user',
          displayName: DEMO_CREDENTIALS.displayName,
          password: DEMO_CREDENTIALS.password,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isProfileComplete: true,
          rememberMe: rememberMe || false,
          inGroup: true
        };
        
        // Store demo user data
        await AsyncStorage.setItem('@user_data', JSON.stringify(demoUser));
        await AsyncStorage.setItem('@demo_mode', 'true');
        
        // Setup demo environment
        await setupDemoEnvironment(demoUser);
        
        // Set user state properly
        await setUserState(demoUser);
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setJustLoggedIn(true);
        
        toastService.success('Welcome to the DoubleDate demo!', 'Demo Login');
        return;
      }
      
      
      // Check for guest accounts
      if (email === 'testing@gmail.com' && password === 'test123') {
        
        // Create dev user profile with full access
        const devUser: User = {
          userId: 'DEV001',
          email: 'testing@gmail.com',
          username: 'dev_user',
          displayName: 'Joey',
          password: 'test123',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isProfileComplete: true,
          rememberMe: rememberMe || false,
          inGroup: true
        };
        
        // Store dev user data
        await AsyncStorage.setItem('@user_data', JSON.stringify(devUser));
        await AsyncStorage.setItem('@dev_mode', 'true');
        
        // Setup comprehensive dev environment
        await setupDemoEnvironment(devUser);
        
        // Set user state properly
        await setUserState(devUser);
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setJustLoggedIn(true);
        
        toastService.success('Welcome to DoubleDate Developer Demo!', 'Dev Login');
        return;
      }
      
      if (email === 'guest1@gmail.com' && password === 'guest123') {
        
        let guestUser = await AsyncStorage.getItem('@guest_user_guest1');
        if (!guestUser) {
          const newGuestUser = {
            userId: 'GUEST002',
            email: 'guest1@gmail.com',
            displayName: 'Guest User',
            firstName: 'Guest',
            lastName: 'User'
          };
          await AsyncStorage.setItem('@guest_user_guest1', JSON.stringify(newGuestUser));
          guestUser = JSON.stringify(newGuestUser);
        }
        
        const parsedGuestUser = JSON.parse(guestUser);
        await AsyncStorage.setItem('@user_data', guestUser);
        
        await setupGuestDemoData();
        
        setState(prev => ({ ...prev, currentUser: parsedGuestUser }));
        setJustLoggedIn(true);
        return;
      }

      // Regular login logic for production users
      const userData = await AsyncStorage.getItem(`@user_${email}`);
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user.password === password) {
          await AsyncStorage.setItem('@user_data', JSON.stringify(user));
          setState(prev => ({ ...prev, currentUser: user }));
          setJustLoggedIn(true);
        } else {
          throw new Error('Invalid password');
        }
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Setup comprehensive demo environment
  const setupDemoEnvironment = async (demoUser: any) => {
    try {
      
      // Create demo user profile with realistic data
      const demoProfile = {
        displayName: 'Joey',
        age: '22',
        location: 'Columbus, OH',
        height: `5'10"`,
        education: 'Ohio State University',
        work: 'College Student',
        lookingFor: 'Meeting new people and exploring connections',
        fitness: 'Gym Rat',
        drinking: 'Socially',
        smoking: 'Never',
        kids: 'Want someday',
        politics: 'Moderate',
        religion: 'Agnostic',
        tags: ['👨‍💻 Developer', '🎓 College Student', '🏋️‍♂️ Gym Rat'],
        photos: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face'
        ],
        prompts: [
          { question: "What's something you're learning?", answer: "Building amazing mobile apps and exploring new technologies" },
          { question: "My ideal Sunday", answer: "Coding projects, hitting the gym, and hanging with friends" },
          { question: "I'm looking for", answer: "Someone who shares my passion for growth and adventure" }
        ]
      };
      
      await AsyncStorage.setItem(`@profile_data_${demoUser.userId}`, JSON.stringify(demoProfile));
      
      // Create demo group assignment
      await groupService.createBotGroups();
      
      // Setup demo AI assistant chat
      await setupDemoAIAssistant(demoUser.userId);
      
    } catch (error) {
    }
  };

  // Setup demo AI assistant chat thread
  const setupDemoAIAssistant = async (userId: string) => {
    try {
      // Determine if this is demo or dev account
      const isDevAccount = userId === 'DEV001';
      const assistantChatId = isDevAccount ? `dev_assistant_${userId}` : `demo_assistant_${userId}`;
      
      // Create comprehensive welcome message as specified in the prompt
      const welcomeMessage = {
        id: `msg_${Date.now()}_1`,
        sender: 'ai_assistant',
        senderName: 'AI Assistant',
        text: `👋 Hey there! Welcome to DoubleDate. This app is built to help couples meet other couples in a safe, fun, and intentional way.

Here's what I can help with:
- 🔍 How to use different features
- 💡 Understanding our mission and design  
- 💻 Technical questions about how the app was built (including code!)

Ask me anything—from how matching works to how the backend is wired. If we're still building a feature, I'll let you know too!

${isDevAccount ? '\n🧪 **Developer Mode**: You have full access to test all features and functionality!' : ''}`,
        timestamp: Date.now(),
        isRead: false,
        type: 'text'
      };
      
      // Create the chat data structure
      const chatData = {
        id: assistantChatId,
        groupName: isDevAccount ? '📘 DoubleDate AI Assistant (Dev)' : '📘 How to Use DoubleDate',
        members: [
          { email: userId, name: 'Joey', userId: userId, isBot: false },
          { email: 'ai_assistant', name: 'AI Assistant', userId: 'ai_assistant', isBot: true }
        ],
        messages: [welcomeMessage],
        lastMessage: welcomeMessage.text.substring(0, 50) + '...',
        lastMessageTime: welcomeMessage.timestamp,
        unreadCount: 1,
        isAIAssistant: true,
        isPinned: true
      };
      
      // Store chat data using the GlobalMessageStore format
      await AsyncStorage.setItem(`@chat_${assistantChatId}`, JSON.stringify(chatData));
      
      // Store the chat in the global message store
      const GlobalMessageStore = require('@/app/(tabs)/messages/[id]').GlobalMessageStore;
      if (GlobalMessageStore) {
        const store = GlobalMessageStore.getInstance();
        store.setChat(assistantChatId, chatData);
      }
      
    } catch (error) {
    }
  };

  const logout = async () => {
    try {
      
      // Clear remembered session and user data
      await AsyncStorage.multiRemove(['@remembered_session', '@user_data']);
      
      // Reset state
      setState({
        isSignedIn: false,
        inGroup: false,
        userId: null,
        username: null,
        email: null,
        isProfileComplete: false,
        currentUser: null,
      });

      setJustLoggedIn(false);
      toastService.success('You have been logged out successfully');
    } catch (error) {
      toastService.error('Failed to logout properly');
    }
  };

  const forceLogout = async () => {
    try {
      
      // Clear all auth-related data
      await AsyncStorage.multiRemove([
        '@remembered_session', 
        '@user_data', 
        '@demo_mode', 
        '@dev_mode'
      ]);
      
      // Set flag to force fresh login on next initialization
      await AsyncStorage.setItem('@force_fresh_login', 'true');
      
      // Reset state
      setState({
        isSignedIn: false,
        inGroup: false,
        userId: null,
        username: null,
        email: null,
        isProfileComplete: false,
        currentUser: null,
      });

      setJustLoggedIn(false);
    } catch (error) {
    }
  };

  const checkProfileCompletion = async (): Promise<boolean> => {
    if (!state.currentUser) return false;

    try {
      // Check profile completion logic here
      // For now, just return the stored value
      const isComplete = state.currentUser.isProfileComplete;
      
      if (isComplete !== state.isProfileComplete) {
        setState(prev => ({ ...prev, isProfileComplete: isComplete }));
      }
      
      return isComplete;
    } catch (error) {
      return false;
    }
  };

  const markProfileComplete = async () => {
    if (!state.userId) return;

    try {
      await userService.markProfileComplete(state.userId);
      
      // Update local state
      setState(prev => ({ 
        ...prev, 
        isProfileComplete: true,
        currentUser: prev.currentUser ? { ...prev.currentUser, isProfileComplete: true } : null
      }));

      // Clear justLoggedIn flag since profile is now complete
      setJustLoggedIn(false);

      toastService.success('Profile completed! Welcome to Double!');
    } catch (error) {
      toastService.error('Failed to update profile status');
    }
  };

  const updateUserData = async (updates: Partial<User>) => {
    if (!state.userId) return;

    try {
      await userService.updateUser(state.userId, updates);
      
      // Update local state
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, ...updates } : null,
        isProfileComplete: updates.isProfileComplete ?? prev.isProfileComplete,
        inGroup: updates.inGroup ?? prev.inGroup,
      }));

    } catch (error) {
      toastService.error('Failed to update user data');
    }
  };

  const resetAllData = async () => {
    try {
      
      // Clear all stored sessions and data
      await AsyncStorage.multiRemove([
        '@remembered_session',
        '@user_data',
        '@profile_data',
        'authState',
        'resetDone'
      ]);
      
      // Clear UserService and GroupService data
      await userService.clearAllData();
      await groupService.clearAllData();
      
      // Reset local state
      setState({
        isSignedIn: false,
        inGroup: false,
        userId: null,
        username: null,
        email: null,
        isProfileComplete: false,
        currentUser: null,
      });

      setJustLoggedIn(false);
      toastService.success('All data reset successfully - ready for fresh signup!');
    } catch (error) {
      toastService.error('Failed to reset all data');
    }
  };

  // Setup guest demo data
  const setupGuestDemoData = async () => {
    try {
      
      // Initialize services if needed
      const groupService = GroupService.getInstance();
      await groupService.createBotGroups();
      
    } catch (error) {
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        ...state, 
        loading, 
        justLoggedIn,
        createAccount,
        login, 
        logout, 
        setJustLoggedIn,
        checkProfileCompletion,
        markProfileComplete,
        updateUserData,
        resetAllData,
        forceLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
