import { Platform } from 'react-native';

export interface ImageSource {
  uri?: string;
  [key: string]: any;
}

// Default fallback image
const DEFAULT_AVATAR = require('../assets/images/icon.png');

export function getImageSource(img: string | number | undefined | null): ImageSource | number {
  // Handle null/undefined
  if (!img) {
    return DEFAULT_AVATAR;
  }
  
  // Handle local require() assets (numbers)
  if (typeof img === 'number') {
    return img;
  }
  
  // Handle remote URLs
  if (typeof img === 'string') {
    // For simulator, ensure we have proper network handling
    if (Platform.OS === 'ios' && __DEV__) {
      // Add timeout and error handling for simulator
      return {
        uri: img,
        cache: 'force-cache', // Better caching for simulator
        headers: {
          'Accept': 'image/*',
        },
      };
    }
    
    return { uri: img };
  }
  
  // Fallback to default
  return DEFAULT_AVATAR;
}

export function getProfileImageSource(user: any): ImageSource | number {
  // Try user.photo first, then user.avatar, then default
  return getImageSource(user?.photo || user?.avatar || user?.image);
}

export function getGroupImageSource(group: any): ImageSource | number {
  // Try multiple possible group image fields
  return getImageSource(group?.groupPhoto || group?.image || group?.photo);
} 