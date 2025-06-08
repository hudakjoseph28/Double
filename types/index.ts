// Core Types

/**
 * @description Base user interface with common properties
 */
export interface BaseUser {
  id: string;
  name: string;
  age: number;
  location?: string;
  photos: string[];
}

/**
 * @description Represents a Q&A prompt
 */
export interface Prompt {
  question: string;
  answer: string;
}

/**
 * @description Extended user profile with additional details
 */
export interface Profile extends BaseUser {
  prompts: Prompt[];
  bio?: string;
}

/**
 * @description Member of a group with specific attributes
 */
export interface GroupMember extends BaseUser {
  photo: string;
  prompts: Prompt[];
  interests?: string[];
  achievements?: string[];
  education?: string;
  occupation?: string;
  // Enhanced profile fields for Double screen
  gender?: string;
  orientation?: string;
  school?: string;
  religion?: string;
  hometown?: string;
  drink?: string;
  smoke?: string;
  intention?: string;
  monogamy?: boolean;
  about?: string;
  idealWeekend?: string;
  funFact?: string;
  dealbreaker?: string;
  vibe?: string;
}

/**
 * @description Represents a group of two users
 */
export interface Group {
  id: string;
  title: string;
  name?: string;
  location: string;
  groupPhoto?: string;
  groupPhotos?: string[];
  photos?: string[];
  user1: GroupMember;
  user2: GroupMember;
  prompt?: Prompt;
}

/**
 * @description Individual message in a conversation
 */
export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

/**
 * @description Chat conversation between users
 */
export interface Conversation {
  id: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages?: Message[];
}

/**
 * @description Like received from another user
 */
export interface Like {
  id: string;
  name: string;
  age: number;
  profileImage: string;
  hint: string;
  timestamp?: string;
  mutual?: boolean;
}

/**
 * @description Current user's profile with additional settings
 */
export interface CurrentUser extends Profile {
  about: string;
  settings?: UserSettings;
  preferences?: UserPreferences;
}

/**
 * @description User application settings
 */
export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  privacy: {
    showOnline: boolean;
    showLastSeen: boolean;
    showReadReceipts: boolean;
  };
}

/**
 * @description User matching preferences
 */
export interface UserPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  distance: number;
  interests: string[];
  dealBreakers: string[];
}

/**
 * @description Global application state
 */
export interface AppState {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * @description Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

/**
 * @description API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * @description Navigation route parameters
 */
export type RootStackParamList = {
  '(tabs)': undefined;
  'group/[id]': { id: string };
  'chat/[id]': { id: string };
  '+not-found': undefined;
};

/**
 * @description Tab navigation parameters
 */
export type TabParamList = {
  group: undefined;
  finder: undefined;
  likes: undefined;
  chat: undefined;
  profile: undefined;
};