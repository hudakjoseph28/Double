import React, { useRef, createContext, useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEMO_MODE } from '@/constants/DevSettings';

import {
  DoubleIcon,
  FindIcon,
  MessagesIcon,
  LikesIcon,
  ProfileIcon,
} from '@/components/icons/TabBarIcons';

// 👇 Scroll/animation context
export const TabBarContext = createContext({
  handleScroll: (scrollDiff: number) => {},
  tabBarTranslateY: new Animated.Value(0),
  headerTranslateY: new Animated.Value(0),
});

export default function TabsLayout() {
  const { isSignedIn, inGroup, isProfileComplete } = useAuth();
  const insets = useSafeAreaInsets();

  // Prevent rendering the tabs if not authenticated
  // Allow access if profile is complete, regardless of group status
  if (!isSignedIn || !isProfileComplete) {
    return <View style={{ flex: 1 }} />;
  }

  // Create animation values with useRef to prevent recreation on each render
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isAnimating = useRef(false);
  const isTabBarHidden = useRef(false);
  const scrollVelocity = useRef(0);
  const lastScrollTime = useRef(Date.now());

  // Memoize the handleScroll function with improved logic
  const handleScroll = useMemo(() => 
    Platform.select({
      web: (scrollDiff: number) => {
        requestAnimationFrame(() => {
          processScroll(scrollDiff);
        });
      },
      default: (scrollDiff: number) => {
        processScroll(scrollDiff);
      },
    }), 
    []
  );

  const processScroll = (scrollDiff: number) => {
    const now = Date.now();
    const timeDiff = now - lastScrollTime.current;
    lastScrollTime.current = now;

    // Calculate velocity (pixels per millisecond)
    scrollVelocity.current = timeDiff > 0 ? Math.abs(scrollDiff) / timeDiff : 0;

    const newY = lastScrollY.current + scrollDiff;
    lastScrollY.current = Math.max(0, newY);

    // Improved thresholds and conditions
    const SCROLL_THRESHOLD = 30; // Minimum scroll distance to trigger
    const VELOCITY_THRESHOLD = 0.5; // Minimum velocity to trigger
    const MIN_SCROLL_POSITION = 80; // Minimum scroll position to allow hiding

    // Show tab bar conditions (scrolling up)
    if (scrollDiff < -5 && (scrollVelocity.current > VELOCITY_THRESHOLD || Math.abs(scrollDiff) > SCROLL_THRESHOLD)) {
      if (isTabBarHidden.current) {
        animateBars(true);
      }
    }
    // Hide tab bar conditions (scrolling down)
    else if (scrollDiff > 5 && newY > MIN_SCROLL_POSITION && (scrollVelocity.current > VELOCITY_THRESHOLD || Math.abs(scrollDiff) > SCROLL_THRESHOLD)) {
      if (!isTabBarHidden.current) {
        animateBars(false);
      }
    }
  };

  const animateBars = (show: boolean) => {
    if (isAnimating.current || isTabBarHidden.current === !show) return;
    
    isAnimating.current = true;
    isTabBarHidden.current = !show;

    const tabBarHeight = 60 + insets.bottom;
    const headerHeight = 60 + insets.top;

    Animated.parallel([
      Animated.spring(tabBarTranslateY, {
        toValue: show ? 0 : tabBarHeight + 10, // Extra 10px for complete hiding
        useNativeDriver: true,
        tension: 80, // Increased tension for snappier animation
        friction: 8,  // Reduced friction for smoother motion
        velocity: show ? -scrollVelocity.current * 100 : scrollVelocity.current * 100,
      }),
      Animated.spring(headerTranslateY, {
        toValue: show ? 0 : -headerHeight,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
        velocity: show ? -scrollVelocity.current * 100 : scrollVelocity.current * 100,
      }),
    ]).start(() => {
      isAnimating.current = false;
    });
  };

  const resetBars = () => {
    lastScrollY.current = 0;
    scrollVelocity.current = 0;
    isTabBarHidden.current = false;
    animateBars(true);
  };

  // Memoize context value to prevent recreation on each render
  const contextValue = useMemo(() => ({
    handleScroll,
    tabBarTranslateY,
    headerTranslateY
  }), [handleScroll, tabBarTranslateY, headerTranslateY]);

  return (
    <TabBarContext.Provider value={contextValue}>
      <Tabs
        initialRouteName="group"
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            { 
              transform: [{ translateY: tabBarTranslateY }],
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
            }
          ],
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          tabBarBackground: () => (
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="group"
          options={{
            tabBarLabel: 'Double',
            tabBarIcon: ({ color, size }) => <DoubleIcon color={color} size={size} />,
            href: isProfileComplete ? undefined : null,
          }}
          listeners={{ tabPress: resetBars }}
        />
        <Tabs.Screen
          name="find/index"
          options={{
            tabBarLabel: 'Find',
            tabBarIcon: ({ color, size }) => <FindIcon color={color} size={size} />,
            href: isProfileComplete ? undefined : null,
          }}
          listeners={{ tabPress: resetBars }}
        />
        <Tabs.Screen
          name="messages/index"
          options={{
            tabBarLabel: 'Messages',
            tabBarIcon: ({ color, size }) => <MessagesIcon color={color} size={size} />,
            href: isProfileComplete ? undefined : null,
          }}
          listeners={{ tabPress: resetBars }}
        />
        <Tabs.Screen
          name="messages/[id]"
          options={{
            tabBarStyle: { display: 'none' }, // Hide tab bar for chat screens
            href: null, // Don't show in tab bar
          }}
        />
        <Tabs.Screen
          name="likes/index"
          options={{
            tabBarLabel: 'Likes',
            tabBarIcon: ({ color, size }) => <LikesIcon color={color} size={size} />,
            href: isProfileComplete ? undefined : null,
          }}
          listeners={{ tabPress: resetBars }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
          }}
          listeners={{ tabPress: resetBars }}
        />
      </Tabs>
    </TabBarContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 4,
  },
});
