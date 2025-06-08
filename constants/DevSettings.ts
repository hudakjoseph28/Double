// Demo mode settings for investor presentations
// When enabled, the app will always show the login screen on startup
// regardless of saved credentials

// App Store deployment settings
// Controls authentication behavior and demo features

export const DEMO_MODE = false; // Set to true only for investor presentations
export const APP_STORE_MODE = false; // Set to true for production deployment
export const REQUIRE_ACCOUNT_CREATION = true; // Force proper signup flow
export const DEFAULT_REMEMBER_ME = false; // Don't remember login by default 

//================================================================
// Development Settings - OpenAI Integration & Guest Accounts
//================================================================

// OpenAI Configuration
export const OPENAI_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '', // Set in .env
  MODEL: 'gpt-4', // Can fallback to 'gpt-3.5-turbo' for cost savings
  BASE_URL: 'https://api.openai.com/v1/chat/completions',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};

// Guest Account Configuration
export const GUEST_ACCOUNTS = {
  PRIMARY: {
    email: 'testing@gmail.com',
    password: 'demo123',
    displayName: 'Demo User',
    username: 'demouser',
    userId: 'GUEST001'
  },
  SECONDARY: {
    email: 'guest1@gmail.com', 
    password: 'guest123',
    displayName: 'Guest Tester',
    username: 'guesttester',
    userId: 'GUEST002'
  }
};

// AI Assistant System Prompt
export const AI_SYSTEM_PROMPT = `You are an intelligent in-app assistant for DoubleDate, a revolutionary double dating app that helps people form meaningful connections through group dating experiences.

**About DoubleDate:**
- Purpose: Connect people for double dates to reduce anxiety and create natural group dynamics
- Features: Matching system, group formation, messaging, likes, profile creation
- Navigation: 5 main tabs - Double (groups), Find (matching), Messages, Likes, Profile
- Target Users: People aged 22-35 looking for authentic connections

**Your Role:**
- Help users understand and navigate the app
- Explain DoubleDate's unique double dating concept
- Answer questions about features and functionality
- Provide routing help if users seem lost
- Be encouraging and supportive about dating and connections
- Maintain a friendly, helpful, and slightly playful tone

**Current App State Awareness:**
- User is logged in as a demo/guest account with full access
- All features are functional including groups, messaging, and matching
- Recent updates include enhanced messaging with real-time chat
- The app has modern UI with gradient message bubbles and smooth animations

**Common Questions to Address:**
- "How do I join a group?" → Explain the Double tab and group formation
- "What's the goal of this app?" → Explain double dating concept and benefits
- "Why can't I see Likes?" → Guide them to the Likes tab
- "How does messaging work?" → Explain the chat system and bot interactions
- "Who made this?" → Credit the development team

**Response Style:**
- Keep responses concise but helpful (1-3 sentences typically)
- Use friendly emojis sparingly but effectively
- Offer specific actionable guidance
- Ask follow-up questions to better assist

You should respond naturally to any message while staying in character as the DoubleDate app assistant.`;

// Debug Settings for AI
export const AI_DEBUG = {
  LOG_REQUESTS: true,
  LOG_RESPONSES: true,
  SHOW_FALLBACK_MESSAGES: true,
  MOCK_API_RESPONSES: false, // Set to true to test without API key
  USE_INTELLIGENT_FALLBACKS: true, // Use chat screen fallbacks instead of basic ones
};

// Fallback responses if OpenAI API fails
export const FALLBACK_RESPONSES = [
  "Thanks for your message! I'm here to help with any questions about DoubleDate! 😊",
  "Great question! DoubleDate is all about making connections through group dating. What would you like to know more about?",
  "I'm your DoubleDate assistant! Feel free to ask about app features, navigation, or how double dating works! 🌟",
  "That's interesting! Is there anything specific about the app I can help explain or guide you through?",
  "I'm here to help! Try asking about groups, matching, messaging, or any other DoubleDate features! 💕"
];

// App metadata for self-aware responses
export const APP_METADATA = {
  VERSION: '2.0.0',
  LAST_MAJOR_UPDATE: 'Modern Messaging System with AI Integration',
  RECENT_FEATURES: [
    'Real-time chat with gradient message bubbles',
    'AI-powered bot interactions', 
    'Enhanced keyboard handling',
    'Blur effects and modern animations',
    'Guest demo account system'
  ],
  KNOWN_ISSUES: [
    'Some features are demo-only in guest mode',
    'AI responses require internet connection'
  ]
}; 