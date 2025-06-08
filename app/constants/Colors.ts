/**
 * @description Modern color system for 2025
 */
const Colors = {
  // Primary colors
  primary: '#FF3B7C',
  primaryLight: '#FF6B9C',
  primaryDark: '#CC2E63',
  
  // Secondary colors
  secondary: '#2A0A3F',
  secondaryLight: '#3D1459',
  secondaryDark: '#1A0626',
  
  // Accent colors
  accent: '#00F5FF',
  
  // Text colors
  text: '#1A1A2F',
  textLight: '#4A4A65',
  textDark: '#0A0A1F',
  textInverse: '#FFFFFF',
  
  // Background colors
  background: '#F8F9FF',
  backgroundDark: '#E8E9F5',
  backgroundLight: '#FFFFFF',
  
  // Status colors
  success: '#00C48C',
  warning: '#FFB800',
  error: '#FF3B5C',
  info: '#0095FF',
  
  // UI element colors
  card: 'rgba(255, 255, 255, 0.95)',
  divider: 'rgba(0, 0, 0, 0.06)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  
  // Semantic colors
  like: '#FF6B6B',
  match: '#4CAF50',
  online: '#4CAF50',
  offline: '#9E9E9E',
  
  // Gradient colors
  gradientStart: '#FF3B7C',
  gradientEnd: '#FF6B9C',
  
  // Dark mode colors
  dark: {
    background: '#1A1A2F',
    card: '#2A2A3F',
    text: '#FFFFFF',
    textLight: '#CCCCCC',
  }
} as const;

export type ColorTheme = typeof Colors;
export default Colors;