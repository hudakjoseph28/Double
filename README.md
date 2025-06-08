# 💖 Double — The Double Dating App

**A revolutionary social matching app that makes double dating effortless, fun, and instant.**

Double revolutionizes online dating by focusing on **couple-to-couple matching** instead of individual profiles. Users browse and like other couples, creating 4-person group chats for coordinating double dates.

---

## 📁 Project Structure

This repository includes the complete Double dating platform:

```
/
├── website/              # Landing website (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── effects.js
│   ├── IphoneMockup3D.jsx
│   └── images/
│
├── app/                  # React Native + Expo mobile app
│   ├── (auth)/          # Login/signup flows  
│   ├── (tabs)/          # Main app tabs (Double, Find, Messages, Likes, Profile)
│   ├── components/      # Reusable UI components
│   ├── services/        # Business logic (User, Group, Analytics, OpenAI)
│   ├── constants/       # Colors, settings, configuration
│   ├── context/         # React Context (Auth, state management)
│   ├── types/           # TypeScript interfaces and types
│   └── assets/          # Images, fonts, static resources
│
├── .gitignore
└── README.md
```

---

## 🏃‍♂️ Quick Start

### Mobile App (React Native/Expo)

**Prerequisites:**
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android emulator

**Installation:**
```bash
# Navigate to app directory
cd app/

# Install dependencies
npm install

# Start development server
npx expo start --clear

# Open on device/simulator
# Use Expo Go app or press 'i' for iOS simulator
```

**Demo Login:**
- **Email**: `testing@gmail.com`
- **Password**: `test123`

### Website
Open `website/index.html` in your browser or serve it with any web server.

---

## 📱 App Features

### Core Dating Experience
- **🏠 Double**: Browse couple profiles and like them (core feature)
- **🔍 Find**: Discover individual users to form couples with
- **💬 Messages**: Chat with AI assistant and group matches
- **💕 Likes**: See who's interested and manage connections  
- **👤 Profile**: Manage photos, prompts, and account settings

### Unique Features
- **AI Assistant**: Comprehensive help with app navigation and dating advice
- **Couple Formation**: Form partnerships on Find tab, browse as couples on Double tab
- **Group Matching**: When couples mutually like each other, 4-person chats open
- **Smart Animations**: Zoom effects on likes, scroll-based headers, smooth transitions

---

## 🔧 Technical Stack

### Mobile App
- **React Native/Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and enhanced developer experience
- **React Native Reanimated**: 60fps animations and gesture handling
- **AsyncStorage**: Local-first data persistence and offline capability

### Backend Architecture
- **Singleton Services**: UserService, GroupService, AnalyticsService, NotificationService
- **OpenAI Integration**: ChatGPT-4 API for intelligent AI assistant responses
- **Real-time Messaging**: Global message store with state synchronization
- **Mock Data**: 30+ realistic bot users for comprehensive testing

### Website
- **HTML5/CSS3/JavaScript**: Modern responsive design
- **3D iPhone Mockup**: Interactive device demonstrations

### Key Services
```typescript
UserService     // Authentication, profiles, bot user management
GroupService    // Couple formation, group invites, matching logic  
AnalyticsService // Event tracking with batch processing
MessageStore    // Real-time chat state management
OpenAIService   // AI response generation with fallbacks
```

---

## 🤖 AI Assistant

The app features a sophisticated AI assistant powered by OpenAI's ChatGPT-4 API:

### Capabilities
- **App Navigation**: Explains all features and how to use them
- **Technical Knowledge**: Understands backend architecture and implementation
- **Dating Advice**: Provides guidance within the app context
- **Contextual Responses**: Knows about recent updates, features, and app state
- **Intelligent Fallbacks**: Works even without OpenAI API key using smart local responses

### Example Interactions
```
"How does DoubleDate work?"
"Explain the backend architecture"  
"How do I join a group?"
"What makes this different from other dating apps?"
```

---

## 🎨 Demo Experience

### What's Included
- **Full Navigation**: All tabs and buttons functional
- **Realistic Data**: Professional photos, authentic profiles, complete user journeys
- **AI Interactions**: Comprehensive assistant with app knowledge
- **Modern UI**: Gradient bubbles, animations, professional design
- **Cross-platform**: Works on iOS and Android

### Demo Account Features
- Auto-login with complete profile setup
- Access to AI Assistant with development insights
- 30+ bot users for realistic browsing experience
- Full messaging and matching functionality
- Professional UI showcasing modern React Native capabilities

---

## 🚀 Deployment Ready

This version is optimized for demonstration and showcasing:

- ✅ **Clean Codebase**: Removed development logs and temporary code
- ✅ **Professional UI**: Modern design with smooth animations
- ✅ **Complete Features**: Every button and flow functional
- ✅ **AI Integration**: Smart assistant with comprehensive knowledge
- ✅ **Cross-platform**: Works on iOS and Android
- ✅ **Production Architecture**: Scalable services and clean code structure

---

## 📄 License

This project is for demonstration purposes. All rights reserved.

---

**Built with ❤️ using React Native, TypeScript, and modern mobile development practices.**
