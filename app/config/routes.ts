import { ExpoConfig } from 'expo/config';

// Define the route paths as constants to ensure type safety
export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    SIGNUP: '/(auth)/signup',
    FORGOT: '/(auth)/forgot',
  },
  TABS: {
    GROUP: '/(tabs)/group',
    MESSAGES: '/(tabs)/messages',
    FIND: '/(tabs)/find',
  },
  MESSAGES: {
    CHAT: (id: string) => `/messages/${id}` as const,
  },
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}` as const,
  },
  VIEW_DOUBLE: '/view-double',
} as const;

// Type for route parameters
export type RouteParams = {
  '/messages/[id]': { id: string };
  '/profile/[id]': { id: string };
};

// Default export placeholder to satisfy expo-router
export default function RoutesPlaceholder() {
  return null;
} 