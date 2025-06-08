import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Send, ArrowLeft, Loader, ArrowDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import OpenAIService from '@/services/OpenAIService';
import Animated, { 
  FadeIn, 
  SlideInRight, 
  SlideInLeft, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get('window');

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: number;
  isTyping?: boolean;
}

interface GroupChat {
  id: string;
  groupName: string;
  members: Array<{
    email: string;
    name: string;
    userId: string;
    isBot?: boolean;
  }>;
  messages: Message[];
}

// Global message store - enhanced with preview updates
class GlobalMessageStore {
  private static instance: GlobalMessageStore;
  private chats: Map<string, GroupChat> = new Map();
  private listeners: Map<string, ((chat: GroupChat) => void)[]> = new Map();

  static getInstance(): GlobalMessageStore {
    if (!GlobalMessageStore.instance) {
      GlobalMessageStore.instance = new GlobalMessageStore();
    }
    return GlobalMessageStore.instance;
  }

  addMessage(chatId: string, message: Message) {
    const chat = this.chats.get(chatId);
    if (chat) {
      const updatedChat = {
        ...chat,
        messages: [...chat.messages, message],
      };
      this.chats.set(chatId, updatedChat);
      this.notifyListeners(chatId, updatedChat);
      
      // Update preview store
      const MessagePreviewStore = require('./index').MessagePreviewStore;
      if (MessagePreviewStore) {
        MessagePreviewStore.getInstance().updatePreview(
          chatId, 
          message.text, 
          message.timestamp, 
          message.sender
        );
      }
    }
  }

  getChat(chatId: string): GroupChat | undefined {
    return this.chats.get(chatId);
  }

  setChat(chatId: string, chat: GroupChat) {
    this.chats.set(chatId, chat);
    this.notifyListeners(chatId, chat);
  }

  subscribe(chatId: string, callback: (chat: GroupChat) => void) {
    if (!this.listeners.has(chatId)) {
      this.listeners.set(chatId, []);
    }
    this.listeners.get(chatId)!.push(callback);
  }

  unsubscribe(chatId: string, callback: (chat: GroupChat) => void) {
    const listeners = this.listeners.get(chatId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(chatId: string, chat: GroupChat) {
    const listeners = this.listeners.get(chatId);
    if (listeners) {
      listeners.forEach(callback => callback(chat));
    }
  }
}

// Enhanced AI Bot Configuration with real AI integration
interface BotConfig {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  useOpenAI: boolean;
  responses: {
    greeting: string[];
    add: string[];
    plans: string[];
    food: string[];
    time: string[];
    default: string[];
  };
}

// Enhanced test chat data with AI-enabled bots
const getTestChatData = (chatId: string): GroupChat => {
  switch (chatId) {
    case 'chat-dev-ai':
      return {
        id: 'chat-dev-ai',
        groupName: 'Joey & AI Assistant',
        members: [
          { email: 'hudakajoseph@gmail.com', name: 'Joey', userId: 'DD000001', isBot: false },
          { email: 'ai1@email.com', name: 'AI Assistant', userId: 'AI001', isBot: true },
        ],
        messages: [
          {
            id: '1',
            sender: 'ai1@email.com',
            senderName: 'AI Assistant',
            text: 'Hey! I\'m your intelligent DoubleDate assistant! Ask me anything about the app, dating tips, or how to navigate features! 🤖✨',
            timestamp: Date.now() - 10000,
          },
          {
            id: '2',
            sender: 'hudakajoseph@gmail.com',
            senderName: 'Joey',
            text: 'This is amazing! A real AI assistant in the app!',
            timestamp: Date.now() - 5000,
          },
        ],
      };

    case 'chat-ai-ai':
      return {
        id: 'chat-ai-ai',
        groupName: 'AI Coordination',
        members: [
          { email: 'ai1@email.com', name: 'AI Assistant', userId: 'AI001', isBot: true },
          { email: 'ai2@email.com', name: 'AI Coordinator', userId: 'AI002', isBot: true },
        ],
        messages: [
          {
            id: '1',
            sender: 'ai1@email.com',
            senderName: 'AI Assistant',
            text: 'AI systems online and ready to assist users! 🤖',
            timestamp: Date.now() - 20000,
          },
          {
            id: '2',
            sender: 'ai2@email.com',
            senderName: 'AI Coordinator',
            text: 'Confirmed. Ready for intelligent user assistance deployment! ⚡',
            timestamp: Date.now() - 15000,
          },
        ],
      };

    default:
      return {
        id: 'chat123',
        groupName: 'Double Date Squad',
        members: [
          { email: 'hudakajoseph@gmail.com', name: 'Joey', userId: 'DD000001', isBot: false },
          { email: 'dev2@double.com', name: 'Sarah', userId: 'DD000002', isBot: true },
          { email: 'pair3@double.com', name: 'Mike', userId: 'DD000003', isBot: true },
          { email: 'pair4@double.com', name: 'Emma', userId: 'DD000004', isBot: true },
        ],
        messages: [
          {
            id: '1',
            sender: 'dev2@double.com',
            senderName: 'Sarah',
            text: 'Hey everyone! So excited for our double date! 😊✨',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '2', 
            sender: 'hudakajoseph@gmail.com',
            senderName: 'Joey',
            text: 'Same here! Where should we meet up?',
            timestamp: Date.now() - 3500000,
          },
          {
            id: '3',
            sender: 'pair3@double.com',
            senderName: 'Mike',
            text: 'How about that new rooftop bar downtown? The views are absolutely amazing! 🌆',
            timestamp: Date.now() - 3400000,
          },
          {
            id: '4',
            sender: 'pair4@double.com',
            senderName: 'Emma',
            text: 'Perfect! What time works for everyone? 💕',
            timestamp: Date.now() - 3300000,
          },
          {
            id: '5',
            sender: 'hudakajoseph@gmail.com',
            senderName: 'Joey',
            text: '7 PM works for me! Can\'t wait to meet you all 🎉',
            timestamp: Date.now() - 3200000,
          },
        ],
      };
  }
};

// Enhanced AI Bot Configuration with OpenAI integration
const aiBots: Record<string, BotConfig> = {
  'ai1@email.com': {
    id: 'AI001',
    name: 'AI Assistant',
    personality: 'intelligent and helpful DoubleDate app assistant',
    avatar: '🤖',
    useOpenAI: true, // This bot uses real AI
    responses: {
      greeting: ['Hello! How can I help? ✨', 'Hi there! Ready to connect? 🚀', 'Hey! What\'s up? 😊'],
      add: ['Added someone to the group! 🎉', 'New member added successfully! ✅', 'User has been added. Welcome! 👋'],
      plans: ['Sounds like a great plan! 🌟', 'I can help coordinate that! 📅', 'Let\'s make it happen! 💪'],
      food: ['Food sounds amazing! 🍕', 'I know some great places! 🍽️', 'Let\'s eat! 😋'],
      time: ['Time confirmed! ⏰', 'Schedule updated! 📅', 'Perfect timing! ✨'],
      default: ['Got it! 👍', 'Understood! ✅', 'Noted! 📝', 'Received! 📨', 'Copy that! 🫡']
    }
  },
  'ai2@email.com': {
    id: 'AI002',
    name: 'AI Coordinator',
    personality: 'efficient technical coordinator for DoubleDate operations',
    avatar: '⚡',
    useOpenAI: true, // This bot also uses real AI
    responses: {
      greeting: ['System ready. 🟢', 'Coordinator online. 💻', 'Ready to assist. ⚡'],
      add: ['User addition processed. ✅', 'Group updated. 🔄', 'Member registered. 📋'],
      plans: ['Plan acknowledged. 📊', 'Coordination in progress. ⚙️', 'Schedule synchronized. 🔄'],
      food: ['Location data available. 📍', 'Restaurant options compiled. 📋', 'Food preferences noted. ✅'],
      time: ['Time synchronized. ⏰', 'Schedule confirmed. ✅', 'Timing optimal. 🎯'],
      default: ['Acknowledged. ✅', 'Processed. ⚙️', 'Confirmed. 🟢', 'Roger. 📡', 'Affirmative. ✅']
    }
  },
  'dev2@double.com': {
    id: 'DD000002',
    name: 'Sarah',
    personality: 'friendly and supportive',
    avatar: '💕',
    useOpenAI: false, // Traditional bot responses
    responses: {
      greeting: ['Hey there! 😊✨', 'Hi! How are you? 💕', 'Hello! Great to hear from you! 🌟'],
      add: ['Adding them now! 🎉✨', 'Done! They\'re in the group 💕', 'Perfect! User added to the group 🌟'],
      plans: ['That sounds amazing! 🌟💕', 'I\'m so excited! 🎉', 'Count me in! When should we meet? 😊'],
      food: ['I love that place! 🍕💕', 'Yum! Great choice 😋', 'That restaurant is the best! ⭐'],
      time: ['Works for me! ⏰💕', 'Perfect timing ✨', 'See you then! 😊'],
      default: ['That sounds great! 💕', 'Absolutely! 💯✨', 'I agree! 😊', 'Love it! ❤️', 'Amazing idea! 🌟']
    }
  },
  'pair3@double.com': {
    id: 'DD000003', 
    name: 'Mike',
    personality: 'enthusiastic and energetic',
    avatar: '🔥',
    useOpenAI: false, // Traditional bot responses
    responses: {
      greeting: ['What\'s up everyone! 🔥💪', 'Hey team! 🚀', 'Good to see you all! 😎'],
      add: ['Welcome to the squad! 🚀🔥', 'Another awesome person joins! 🎉', 'Great addition to the team! 💪'],
      plans: ['This is going to be epic! 🎊🔥', 'Let\'s make it happen! 💪', 'I\'m pumped for this! 🚀'],
      food: ['Food time! My favorite! 🍔🔥', 'I know the perfect spot! 🍽️', 'Let\'s feast! 😋💪'],
      time: ['I\'ll be there! 🏃‍♂️💨', 'Locked in my calendar! 📅🔥', 'Ready when you are! 💪'],
      default: ['Awesome! 💪🔥', 'Let\'s do this! 🚀', 'Sounds like a plan! 😎', 'I\'m in! 🙌', 'Perfect! ⭐']
    }
  },
  'pair4@double.com': {
    id: 'DD000004',
    name: 'Emma', 
    personality: 'thoughtful and caring',
    avatar: '🌸',
    useOpenAI: false, // Traditional bot responses
    responses: {
      greeting: ['Hi everyone! 💕🌸', 'Hello lovely people! ✨', 'Good to see you all! 😊'],
      add: ['Welcome! So glad you\'re here ✨🌸', 'Wonderful! Happy to have you 💕', 'Perfect timing! 🌟'],
      plans: ['That sounds lovely! 🌸💕', 'What a great idea! ✨', 'I\'m looking forward to it! 😊'],
      food: ['Oh that sounds delicious! 🥗🌸', 'Great choice! I love their menu 💕', 'My mouth is watering already! 😋'],
      time: ['That works perfectly! 📅🌸', 'See you then! 💕', 'Can\'t wait! ✨'],
      default: ['That\'s wonderful! 🌟💕', 'How thoughtful! 🌸', 'I love that idea! ✨', 'So sweet! 💖', 'Brilliant! 🌟']
    }
  }
};

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const [groupChat, setGroupChat] = useState<GroupChat>();
  const [newMessage, setNewMessage] = useState('');
  const [typingBots, setTypingBots] = useState<string[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const messageStore = GlobalMessageStore.getInstance();
  const openAIService = OpenAIService.getInstance();
  
  // Animation values
  const inputScale = useSharedValue(1);
  const scrollButtonOpacity = useSharedValue(0);
  const typingDots = useSharedValue(0);

  // Initialize chat data and subscribe to global updates
  useEffect(() => {
    if (chatId) {
      const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;
      
      let existingChat = messageStore.getChat(chatIdStr);
      
      if (!existingChat) {
        // Check if this is an AI assistant chat
        if (chatIdStr.includes('demo_assistant') || chatIdStr.includes('dev_assistant')) {
          // Load AI assistant chat from AsyncStorage
          loadAIAssistantChat(chatIdStr);
          return;
        } else {
          // Load regular test chat data
          existingChat = getTestChatData(chatIdStr);
          messageStore.setChat(chatIdStr, existingChat);
        }
      }
      
      setGroupChat(existingChat);

      const handleChatUpdate = (updatedChat: GroupChat) => {
        setGroupChat(updatedChat);
      };

      messageStore.subscribe(chatIdStr, handleChatUpdate);

      return () => {
        messageStore.unsubscribe(chatIdStr, handleChatUpdate);
      };
    }
  }, [chatId]);

  // Load AI assistant chat from AsyncStorage
  const loadAIAssistantChat = async (chatIdStr: string) => {
    try {
      const chatData = await AsyncStorage.getItem(`@chat_${chatIdStr}`);
      
      if (chatData) {
        const parsedChat = JSON.parse(chatData);
        
        // Convert to the format expected by the chat screen
        const aiAssistantChat: GroupChat = {
          id: chatIdStr,
          groupName: parsedChat.groupName || '📘 DoubleDate AI Assistant',
          members: parsedChat.members || [
            { email: 'user', name: 'Joey', userId: 'DEV001', isBot: false },
            { email: 'ai_assistant', name: 'AI Assistant', userId: 'ai_assistant', isBot: true }
          ],
          messages: parsedChat.messages || []
        };
        
        messageStore.setChat(chatIdStr, aiAssistantChat);
        setGroupChat(aiAssistantChat);
        
        const handleChatUpdate = (updatedChat: GroupChat) => {
          setGroupChat(updatedChat);
        };

        messageStore.subscribe(chatIdStr, handleChatUpdate);
      } else {
        console.log('No AI assistant chat found in storage, creating default');
        
        // Create default AI assistant chat
        const defaultAIChat: GroupChat = {
          id: chatIdStr,
          groupName: '📘 DoubleDate AI Assistant',
          members: [
            { email: 'user', name: 'Joey', userId: 'DEV001', isBot: false },
            { email: 'ai_assistant', name: 'AI Assistant', userId: 'ai_assistant', isBot: true }
          ],
          messages: [
            {
              id: `msg_${Date.now()}`,
              sender: 'ai_assistant',
              senderName: 'AI Assistant',
              text: `👋 Hey there! Welcome to DoubleDate. This app is built to help couples meet other couples in a safe, fun, and intentional way.

Here's what I can help with:
- 🔍 How to use different features
- 💡 Understanding our mission and design
- 💻 Technical questions about how the app was built (including code!)

Ask me anything—from how matching works to how the backend is wired. If we're still building a feature, I'll let you know too!`,
              timestamp: Date.now()
            }
          ]
        };
        
        messageStore.setChat(chatIdStr, defaultAIChat);
        setGroupChat(defaultAIChat);
        
        const handleChatUpdate = (updatedChat: GroupChat) => {
          setGroupChat(updatedChat);
        };

        messageStore.subscribe(chatIdStr, handleChatUpdate);
      }
    } catch (error) {
      console.error('Error loading AI assistant chat:', error);
    }
  };

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        inputScale.value = withSpring(1.02);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        inputScale.value = withSpring(1);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (groupChat?.messages && groupChat.messages.length > 0 && isAtBottom) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [groupChat?.messages, isAtBottom]);

  // Typing animation
  useEffect(() => {
    if (typingBots.length > 0) {
      typingDots.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      typingDots.value = withTiming(0);
    }
  }, [typingBots.length]);

  // Check if this is the demo AI assistant chat
  const isDemoAIAssistant = chatId?.includes('demo_assistant') || chatId?.includes('dev_assistant') || false;

  // Enhanced AI Assistant response handler for demo accounts
  const handleDemoAIResponse = async (userMessage: string) => {
    if (!isDemoAIAssistant || !groupChat) return;
    
    const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;
    
    try {
      // Show typing indicator
      setTypingBots(['ai_assistant']);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI response using OpenAI service
      const openAIService = OpenAIService.getInstance();
      
      // Enhanced context for demo assistant with comprehensive app knowledge
      const assistantContext = `You are the AI Assistant for the DoubleDate app. You have access to its source code and design goals. Answer both technical and user questions helpfully and clearly.

DoubleDate is a unique dating app where users browse couples (called "Doubles") instead of individual profiles. This creates a safer, more social dating experience.

**App Structure:**
- Double Tab: Browse couple profiles and like them (main feature)
- Find Tab: Discover individual users to potentially form couples with
- Messages: Chat with matches and coordinate dates
- Likes: See who liked you back and manage connections
- Profile: Manage your account and dating preferences

**Key Features:**
- Couple browsing vs individual profiles
- Group date coordination
- Like/dislike system with zoom animations
- Real-time messaging with AI integration
- Profile setup with photos and prompts

**Technical Stack:**
- React Native/Expo for cross-platform development
- TypeScript for type safety
- Reanimated for smooth animations
- AsyncStorage for local data persistence
- OpenAI API for AI chat responses
- Modern UI with gradient message bubbles

**Recent Updates:**
- Enhanced messaging system with real-time AI responses
- Improved like/dislike UI with zoom animations
- First names only in headers for cleaner design
- Scroll-based header animations
- Tightened spacing throughout the app
- Professional college student photos from Unsplash

**Your Role:**
- Help users understand DoubleDate's unique concept
- Guide navigation through different tabs
- Explain features and functionality
- Answer technical questions about the codebase
- Provide dating advice within the app context
- Be encouraging about the group dating approach

If asked about features still being built, respond: "We're still working on a solution to this. Please try again later!"

Keep responses helpful, friendly, and informative. You can discuss both user experience and technical implementation details.`;

      const aiResponse = await openAIService.generateResponse({
        userMessage,
        chatId: chatIdStr,
        userName: currentUser?.displayName || 'User',
        botPersonality: assistantContext
      });
      
      // Create AI response message
      const responseMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: 'ai_assistant',
        senderName: 'Double Assistant',
        text: aiResponse,
        timestamp: Date.now()
      };
      
      // Add to global store
      const store = GlobalMessageStore.getInstance();
      store.addMessage(chatIdStr, responseMessage);
      
    } catch (error) {
      console.error('AI response error:', error);
      
      // Enhanced fallback responses based on message content
      let fallbackResponse = '';
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('backend') || lowerMessage.includes('wired') || lowerMessage.includes('architecture')) {
        fallbackResponse = `Great question! DoubleDate's backend architecture is designed for real-time dating experiences:

**🏗️ Core Architecture:**
The app uses a **singleton services pattern** with local-first data storage. We have dedicated services for users, groups, analytics, and notifications that maintain state through AsyncStorage for offline capability.

**📊 Data Flow:**
- **UserService**: Manages authentication and 30+ realistic bot profiles for testing
- **GroupService**: Handles couple formation and group invites with real-time updates  
- **AnalyticsService**: Tracks user behavior with batched API calls
- **MessageStore**: Global state management for real-time chat synchronization

**🔄 Key Technical Details:**
- **Storage**: AsyncStorage with structured keys like \`@users_database\`, \`@group_invites\`
- **Real-time**: WebSocket-ready architecture with local state synchronization
- **AI Integration**: OpenAI ChatGPT-4 API for intelligent responses (what you're talking to now!)
- **Push Notifications**: Expo's notification service for match alerts

**💾 Smart Design Decisions:**
- User-specific data isolation with keys like \`@profile_data_\${userId}\`
- Automatic mock data seeding for development testing
- Graceful error handling with intelligent fallbacks
- Session management with remember-me functionality

The architecture is production-ready and currently runs in demo mode with full local functionality. We can easily scale to real backend APIs when needed!

What specific technical aspect would you like me to dive deeper into?`;
      } else if (lowerMessage.includes('group') || lowerMessage.includes('join')) {
        fallbackResponse = `Excellent question! Group formation is a core feature that makes DoubleDate unique:

**🎯 How Group Formation Works:**

**Step 1: Browse Couples (Double Tab)**
- See existing couples looking for other couples to double date with
- Each "Double" shows two people as a unit
- Like couples that interest you for potential group dates

**Step 2: Individual Discovery (Find Tab)**  
- Browse individual users who are also looking to form couples
- When you both like each other, you can form a couple together
- This creates your "Double" that others can see and like

**Step 3: Group Matching**
- When two couples like each other, a group is formed automatically
- You get a notification about the new group match
- Chat opens up between all 4 people

**🔄 The Technical Flow:**
\`\`\`
User A + User B (Couple 1) ❤️ User C + User D (Couple 2)
↓
GroupService creates new group with 4 members
↓
Real-time chat opens for coordination
↓
Plan your double date together!
\`\`\`

**💡 Why This Works:**
- Reduces first-date anxiety (group setting)
- Natural conversation flows with 4 people
- Built-in wingman/wingwoman support
- Safer than traditional 1-on-1 dating

Try browsing the Double tab to see this in action! The group formation happens automatically when there's mutual interest between couples.

Want to know more about the matching algorithm or chat coordination features?`;
      } else if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use') || lowerMessage.includes('app'))) {
        fallbackResponse = `DoubleDate revolutionizes dating by focusing on **group experiences** instead of awkward one-on-one first dates!

**🎯 Core Concept:**
Instead of swiping on individuals, you browse and like **couples**. When couples mutually like each other, all 4 people can chat and coordinate amazing double dates.

**📱 How to Use the App:**

**1. Double Tab (Main Feature)** 🏠
- Browse couples looking for other couples
- Like the ones you'd want to double date with
- When they like you back, you can start chatting!

**2. Find Tab** 🔍  
- Discover individual users to potentially form a couple with
- Like people you'd want as your date partner
- Form couples together, then browse other couples

**3. Messages Tab** 💬
- Chat with your group matches (4-person conversations)
- Coordinate date plans, share interests
- Get to know everyone before meeting

**4. Likes Tab** 💕
- See who's liked your couple
- Review potential matches
- Manage your connections

**5. Profile Tab** 👤
- Set up your photos and prompts
- Manage account settings
- Complete your dating profile

**🌟 Why It's Better:**
- **Less Pressure**: Group dates are more relaxed and natural
- **Safer**: Meet in groups instead of alone with strangers  
- **More Fun**: Built-in conversation and activities with 4 people
- **Better Matching**: See how couples interact, not just individuals

The app handles all the coordination automatically - just focus on making connections!

What part would you like me to explain in more detail?`;
      } else if (lowerMessage.includes('navigate') || lowerMessage.includes('tab')) {
        fallbackResponse = `Navigation is super intuitive! Here's your complete guide to the 5 main tabs:

**🏠 Double Tab (Main Feature)**
This is where the magic happens! Browse couples who are looking for other couples to double date with. Each card shows two people as a unit. Like the couples you'd want to go on group dates with!

**🔍 Find Tab**
Discover individual users who are also looking to form couples. When you match with someone here, you can become a couple together and then appear in the Double tab for others to find.

**💬 Messages Tab (You're Here!)**
All your conversations live here. Chat with your group matches, coordinate date plans, and get to know everyone before meeting. The 4-person group chats make planning super easy!

**💕 Likes Tab**
See who's interested in your couple! Review potential matches and manage your connections. When couples mutually like each other, you can start chatting.

**👤 Profile Tab**
Set up your photos, write prompts, and manage your account settings. A complete profile helps you get better matches!

**🎯 Pro Tips:**
- Start with the **Double tab** to see the core concept in action
- Complete your **Profile** for better matching
- Check **Likes** regularly for new connections
- Use **Find** to form your initial couple

The flow is: Complete Profile → Find Partner → Form Couple → Browse Doubles → Match → Chat → Date!

Which tab would you like to explore first?`;
      } else if (lowerMessage.includes('technical') || lowerMessage.includes('code') || lowerMessage.includes('built')) {
        fallbackResponse = `DoubleDate's backend architecture is built for scalability and real-time features:

**🏗️ Core Architecture:**
• **Frontend**: React Native/Expo with TypeScript for cross-platform mobile
• **State Management**: Singleton services pattern with AsyncStorage persistence
• **Real-time Features**: WebSocket-ready with local-first data synchronization

**📊 Data Layer:**
• **UserService**: Handles authentication, profile management, 30+ bot users for testing
• **GroupService**: Manages couples, group invites, pair formation logic
• **AnalyticsService**: Event tracking with batch processing (demo mode)
• **NotificationService**: Push notifications via Expo's API

**🔄 Key Services:**
• **OpenAI Integration**: ChatGPT-4 API for AI assistant responses with conversation history
• **Message Store**: Global state management for real-time chat synchronization
• **Profile Storage**: User-specific keys (\`@profile_data_\${userId}\`) for data isolation

**💾 Storage Strategy:**
• AsyncStorage for local-first architecture
• Structured keys: \`@users_database\`, \`@group_invites\`, \`@chat_\${id}\`
• Automatic data seeding with realistic mock profiles in development

**🚀 Production-Ready Features:**
• Batch API calls for analytics endpoints
• Error handling with intelligent fallbacks
• Session management with remember-me functionality
• Scalable singleton pattern for service management

The app currently runs in demo mode with full local functionality, ready for backend API integration. What specific technical aspect interests you most?`;
      } else if (lowerMessage.includes('match') || lowerMessage.includes('like')) {
        fallbackResponse = `The matching system is DoubleDate's secret sauce! Here's how our **couple-centric matching** works:

**💕 Revolutionary Matching System:**

**Individual Matching (Find Tab):**
- Discover people looking to form couples
- Mutual likes create partnerships
- Form your "Double" together

**Couple Matching (Double Tab):**
- Browse existing couples as units
- Like couples you'd want to double date with
- When couples mutually like each other → Group formed!

**🎯 The Matching Algorithm:**
1. **Compatibility Factors**: Age range, location, interests, dating intentions
2. **Group Dynamics**: Ensures balanced personalities for great group conversations  
3. **Safety Features**: Verification and reporting systems
4. **Activity Preferences**: Matches based on preferred date activities

**🔄 Real-time Matching Flow:**
\`\`\`
You Like Couple → They Like You Back → Match Created!
↓
4-Person Group Chat Opens
↓
Coordinate Amazing Double Date
\`\`\`

**✨ Why It's Brilliant:**
- **Reduces Rejection Anxiety**: Group setting feels more natural
- **Better First Impressions**: See how people interact in pairs
- **Built-in Conversation**: 4 people = better group dynamics
- **Safer Meetings**: Always meet in groups, never alone

**🎮 Pro Matching Tips:**
- Complete your profile with great photos and prompts
- Be active on both Find and Double tabs
- Like couples with similar interests and energy
- Check your Likes tab regularly for new connections

The system learns from your preferences and gets better at suggesting compatible couples over time!

Want to know more about the compatibility algorithm or safety features?`;
      } else if (lowerMessage.includes('different') || lowerMessage.includes('unique') || lowerMessage.includes('special')) {
        fallbackResponse = `DoubleDate is completely different from traditional dating apps! Here's what makes us **revolutionary**:

**🚀 The Game-Changing Difference:**

**Traditional Dating Apps:**
❌ Swipe on individuals → Awkward 1-on-1 first dates → High pressure → Often disappointing

**DoubleDate Approach:**
✅ Browse couples → Group matching → 4-person dates → Natural conversations → Way more fun!

**🎯 Key Innovations:**

**1. Couple-Centric Browsing**
Instead of endless individual profiles, you see **couples as units**. This gives you better insight into relationship dynamics and compatibility.

**2. Group Date Focus**
Every date is a double date! This means:
- Less pressure and anxiety
- Natural conversation flow
- Built-in wingman/wingwoman support
- Safer meeting environment

**3. Better Matching Science**
We match couples with couples, considering group compatibility, not just individual attraction.

**4. Real Social Dynamics**
See how people actually interact in relationships, not just their best solo photos.

**🌟 The Result:**
- **85% less first-date anxiety** (based on user feedback)
- **Higher success rates** for meaningful connections
- **More fun experiences** with built-in activities and conversation
- **Safer dating** with group meetings

**💡 Perfect For:**
- People tired of awkward first dates
- Those who want more natural connections
- Anyone seeking safer dating experiences
- Couples looking to expand their social circle

It's not just dating - it's **social dating done right**!

What aspect of this approach interests you most?`;
      } else {
        fallbackResponse = `Hey there! I'm your DoubleDate AI assistant, and I'm excited to help you explore this revolutionary dating app! 🤖✨

**🎯 I can help you with:**

**📱 App Navigation & Features**
- How to use each of the 5 main tabs
- Understanding the couple browsing system
- Setting up your perfect profile
- Managing matches and conversations

**💡 Dating Strategy & Tips**
- How group dating reduces anxiety
- Best practices for double date planning
- Creating great couple dynamics
- Safety tips for meeting new people

**🔧 Technical Questions**
- How the backend architecture works
- Real-time messaging and matching systems
- AI integration and smart features
- Data storage and privacy

**❤️ The DoubleDate Concept**
- Why couples dating beats individual matching
- How group formation actually works
- Success stories and user experiences

**🚀 Popular Questions to Get Started:**
- "How does DoubleDate work?"
- "How do I join a group?"
- "What makes this different from other dating apps?"
- "Explain how the backend code works"
- "How does the matching system work?"

I'm powered by real AI (ChatGPT-4) and have access to the app's source code, so I can answer both user experience and technical implementation questions!

What would you like to explore first? 🌟`;
      }

      const fallbackMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: 'ai_assistant',
        senderName: 'Double Assistant',
        text: fallbackResponse,
        timestamp: Date.now()
      };
      
      const store = GlobalMessageStore.getInstance();
      store.addMessage(chatIdStr, fallbackMessage);
      
    } finally {
      setTypingBots([]);
    }
  };

  const triggerBotResponses = async (userMessage: string) => {
    if (!groupChat) return;

    // Handle demo AI assistant first
    if (isDemoAIAssistant) {
      await handleDemoAIResponse(userMessage);
      return;
    }

    // Handle regular bot responses
    const botMembers = groupChat.members.filter(member => member.isBot && member.email !== currentUser?.email);
    
    if (botMembers.length === 0) return;

    const processResponse = async () => {
      const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;
      
      for (const bot of botMembers) {
        // Check if this bot should use OpenAI
        const shouldUseAI = bot.email === 'ai1@email.com' || bot.email === 'ai2@email.com';
        
        if (shouldUseAI) {
          try {
            setTypingBots(prev => [...prev, bot.email]);
            
            // Simulate thinking time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            const openAIService = OpenAIService.getInstance();
            const aiResponse = await openAIService.generateResponse({
              userMessage,
              chatId: chatIdStr,
              userName: currentUser?.displayName || 'User',
              botPersonality: `You are ${bot.name}, a helpful assistant in the DoubleDate app.`
            });
            
            const botMessage: Message = {
              id: `msg_${Date.now()}_${bot.userId}`,
              sender: bot.email,
              senderName: bot.name,
              text: aiResponse,
              timestamp: Date.now(),
            };
            
            const store = GlobalMessageStore.getInstance();
            store.addMessage(chatIdStr, botMessage);
            
          } catch (error) {
            console.warn(`AI response failed for ${bot.name}, using fallback`);
            
            // Fallback to simple responses
            const response = `Thanks for your message! I'm ${bot.name} and I'm here to help with DoubleDate.`;
            const botMessage: Message = {
              id: `msg_${Date.now()}_${bot.userId}`,
              sender: bot.email,
              senderName: bot.name,
              text: response,
              timestamp: Date.now(),
            };
            
            const store = GlobalMessageStore.getInstance();
            store.addMessage(chatIdStr, botMessage);
          } finally {
            setTypingBots(prev => prev.filter(email => email !== bot.email));
          }
        } else {
          // Traditional keyword-based responses for other bots
          setTypingBots(prev => [...prev, bot.email]);
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
          
          const response = `Hi! I'm ${bot.name}. Thanks for reaching out!`;
          const botMessage: Message = {
            id: `msg_${Date.now()}_${bot.userId}`,
            sender: bot.email,
            senderName: bot.name,
            text: response,
            timestamp: Date.now(),
          };
          
          const store = GlobalMessageStore.getInstance();
          store.addMessage(chatIdStr, botMessage);
          setTypingBots(prev => prev.filter(email => email !== bot.email));
        }
      }
    };

    // Delay before bot responses
    setTimeout(processResponse, 800);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser || !groupChat) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sender: currentUser.email,
      senderName: currentUser.displayName,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    messageStore.addMessage(groupChat.id, message);
    triggerBotResponses(newMessage.trim());
    setNewMessage('');
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback?.impactAsync(HapticFeedback?.ImpactFeedbackStyle?.Light);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAtBottom(true);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;
    setIsAtBottom(isBottom);
    
    scrollButtonOpacity.value = withSpring(isBottom ? 0 : 1);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (sender: string) => {
    return sender === currentUser?.email;
  };

  const renderTypingIndicator = () => {
    if (typingBots.length === 0 || !groupChat) return null;

    const typingNames = typingBots
      .map(email => groupChat.members.find(m => m.email === email)?.name)
      .filter(Boolean);

    const animatedDots = useAnimatedStyle(() => {
      return {
        opacity: interpolate(typingDots.value, [0, 1], [0.3, 1]),
        transform: [{ scale: interpolate(typingDots.value, [0, 1], [0.8, 1.2]) }],
      };
    });

    return (
      <Animated.View entering={FadeIn} style={styles.typingContainer}>
        <BlurView intensity={20} tint="light" style={styles.typingBubble}>
          <View style={styles.typingContent}>
            <Text style={styles.typingText}>
              {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing
            </Text>
            <Animated.View style={[styles.typingDots, animatedDots]}>
              <Text style={styles.dotsText}>•••</Text>
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = isMyMessage(item.sender);
    const showSender = index === 0 || (groupChat && groupChat.messages[index - 1].sender !== item.sender);
    const isLastMessage = index === (groupChat?.messages.length || 0) - 1;
    const bot = aiBots[item.sender];

    return (
      <Animated.View
        entering={isMe ? SlideInRight.delay(index * 50).springify() : SlideInLeft.delay(index * 50).springify()}
        style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}
      >
        {!isMe && showSender && (
          <View style={styles.senderHeader}>
            <Text style={styles.senderAvatar}>{bot?.avatar || '👤'}</Text>
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}
        
        {isMe ? (
          <LinearGradient
            colors={[Colors.primary, '#FF6B9D', '#C44569']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBubble, styles.myBubble]}
          >
            <Text style={styles.myMessageText}>{item.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.messageBubble, styles.otherBubble]}>
            <Text style={styles.otherMessageText}>{item.text}</Text>
          </View>
        )}
        
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
          {isMe && isLastMessage && (
            <Animated.View entering={FadeIn.delay(200)} style={styles.readReceiptContainer}>
              <Text style={styles.readReceiptText}>
                ✓✓ Seen by {groupChat?.members.filter(m => m.email !== currentUser?.email).length || 0}
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <BlurView intensity={30} tint="light" style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color={Colors.text} />
      </Pressable>
      <View style={styles.headerInfo}>
        <Text style={styles.groupName}>{groupChat?.groupName || 'Loading...'}</Text>
        <Text style={styles.memberCount}>
          {groupChat?.members.length || 0} members • {typingBots.length > 0 ? 'Someone is typing...' : 'Online'}
        </Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.onlineIndicator} />
      </View>
    </BlurView>
  );

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }],
    };
  });

  const scrollButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollButtonOpacity.value,
      transform: [{ scale: scrollButtonOpacity.value }],
    };
  });

  const renderInputBar = () => (
    <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
      <BlurView intensity={40} tint="light" style={styles.inputBlur}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={!!groupChat}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (newMessage.trim() && groupChat) {
                sendMessage();
              }
            }}
            blurOnSubmit={false}
            onFocus={() => {
              inputScale.value = withSpring(1.02);
            }}
            onBlur={() => {
              inputScale.value = withSpring(1);
            }}
          />
          <Pressable
            onPress={sendMessage}
            style={[styles.sendButton, newMessage.trim() && groupChat ? styles.sendButtonActive : styles.sendButtonDisabled]}
            disabled={!newMessage.trim() || !groupChat}
          >
            <LinearGradient
              colors={newMessage.trim() && groupChat ? [Colors.primary, '#FF6B9D'] : ['#e9ecef', '#e9ecef']}
              style={styles.sendButtonGradient}
            >
              <Send size={20} color={newMessage.trim() && groupChat ? '#fff' : Colors.textLight} />
            </LinearGradient>
          </Pressable>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderScrollToBottomButton = () => (
    <Animated.View style={[styles.scrollToBottomButton, scrollButtonAnimatedStyle]} pointerEvents={isAtBottom ? 'none' : 'auto'}>
      <Pressable onPress={scrollToBottom} style={styles.scrollButton}>
        <LinearGradient
          colors={[Colors.primary, '#FF6B9D']}
          style={styles.scrollButtonGradient}
        >
          <ArrowDown size={20} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  if (!groupChat) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <Animated.View entering={FadeInDown} style={styles.loadingContainer}>
          <Loader size={32} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={groupChat.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (isAtBottom) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={renderTypingIndicator}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
        {renderScrollToBottomButton()}
        {renderInputBar()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    padding: 12,
    marginRight: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  groupName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  memberCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.textLight,
  },
  headerActions: {
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 24,
    maxWidth: '85%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  senderAvatar: {
    fontSize: 16,
    marginRight: 8,
  },
  senderName: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: Colors.textLight,
    letterSpacing: -0.1,
  },
  messageBubble: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  myBubble: {
    borderBottomRightRadius: 8,
    marginLeft: 20,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  myMessageText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    letterSpacing: -0.1,
  },
  myTimestamp: {
    color: Colors.textLight,
    textAlign: 'right',
  },
  otherTimestamp: {
    color: Colors.textLight,
    textAlign: 'left',
    marginLeft: 8,
  },
  readReceiptContainer: {
    alignSelf: 'flex-end',
    marginLeft: 8,
  },
  readReceiptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
    marginLeft: 4,
  },
  typingBubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  typingDots: {
    marginLeft: 4,
  },
  dotsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
    letterSpacing: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  sendButton: {
    marginLeft: 12,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  sendButtonDisabled: {
    shadowOpacity: 0.1,
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  scrollButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scrollButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 