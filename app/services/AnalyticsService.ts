import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type AnalyticsEvent = 
  | 'app_opened'
  | 'profile_viewed'
  | 'like_sent'
  | 'match_created'
  | 'message_sent'
  | 'group_created'
  | 'swipe_right'
  | 'swipe_left'
  | 'filter_applied'
  | 'premium_upgrade'
  | 'notification_clicked'
  | 'session_start'
  | 'session_end';

export interface AnalyticsData {
  eventType: AnalyticsEvent;
  timestamp: number;
  userId?: string;
  groupId?: string;
  targetUserId?: string;
  duration?: number;
  metadata?: Record<string, any>;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  sessionId: string;
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
  conversionFunnel: {
    profileViews: number;
    likes: number;
    matches: number;
    conversations: number;
    meetups: number;
  };
}

export interface GrowthMetrics {
  newSignups: number;
  signupConversionRate: number;
  userGrowthRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: number;
  private isInitialized = false;
  private eventQueue: AnalyticsData[] = [];
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initialize();
  }

  private async initialize() {
    try {
      // Load any queued events from storage
      const queuedEvents = await AsyncStorage.getItem('@analytics_queue');
      if (queuedEvents) {
        this.eventQueue = JSON.parse(queuedEvents);
      }

      // Set up auto-flush
      setInterval(() => {
        this.flushEvents();
      }, this.flushInterval);

      this.isInitialized = true;

      // Track session start
      this.trackEvent('session_start');
    } catch (error) {
      console.error('🚨 Error initializing analytics:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core tracking method
  async trackEvent(
    eventType: AnalyticsEvent,
    metadata?: Record<string, any>,
    userId?: string,
    targetUserId?: string,
    groupId?: string
  ) {
    try {
      const eventData: AnalyticsData = {
        eventType,
        timestamp: Date.now(),
        userId,
        groupId,
        targetUserId,
        metadata,
        platform: Platform.OS as 'ios' | 'android',
        appVersion: '1.0.0', // This should come from app config
        sessionId: this.sessionId,
      };

      this.eventQueue.push(eventData);

      // Auto-flush if queue is full
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }

      // Save to storage as backup
      await AsyncStorage.setItem('@analytics_queue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('🚨 Error tracking event:', error);
    }
  }

  // Flush events to analytics backend
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToSend = [...this.eventQueue];
      this.eventQueue = [];

      // DEMO MODE: Events are processed but not logged to reduce console noise
      // Clear from storage since we're in demo mode
      await AsyncStorage.removeItem('@analytics_queue');

      // In production, you would uncomment this and use a real endpoint:
      /*
      const response = await fetch('https://your-analytics-endpoint.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify({
          events: eventsToSend,
          batchId: this.generateSessionId(),
        }),
      });

      if (response.ok) {
        await AsyncStorage.removeItem('@analytics_queue');
      } else {
        this.eventQueue.unshift(...eventsToSend);
        console.error('🚨 Failed to send analytics events');
      }
      */
    } catch (error) {
      console.warn('⚠️ Error in demo analytics flush:', error);
      // In demo mode, don't re-queue events to avoid infinite retries
    }
  }

  // Specific tracking methods for common events
  async trackProfileView(viewedUserId: string, viewerUserId: string, duration?: number) {
    await this.trackEvent('profile_viewed', {
      duration,
      viewContext: 'double_browse',
    }, viewerUserId, viewedUserId);
  }

  async trackLike(fromUserId: string, toUserId: string, groupId?: string) {
    await this.trackEvent('like_sent', {
      likeType: groupId ? 'group' : 'individual',
    }, fromUserId, toUserId, groupId);
  }

  async trackMatch(userId1: string, userId2: string, groupId?: string) {
    await this.trackEvent('match_created', {
      matchType: groupId ? 'group' : 'individual',
      timeSinceFirstInteraction: Date.now(),
    }, userId1, userId2, groupId);
  }

  async trackMessage(fromUserId: string, toUserId: string, messageLength: number) {
    await this.trackEvent('message_sent', {
      messageLength,
      isFirstMessage: false, // This should be calculated
    }, fromUserId, toUserId);
  }

  async trackSwipe(userId: string, targetUserId: string, direction: 'left' | 'right') {
    await this.trackEvent(direction === 'right' ? 'swipe_right' : 'swipe_left', {
      swipeContext: 'main_feed',
    }, userId, targetUserId);
  }

  async trackGroupCreation(creatorUserId: string, groupId: string, memberCount: number) {
    await this.trackEvent('group_created', {
      memberCount,
      creationTime: Date.now(),
    }, creatorUserId, undefined, groupId);
  }

  async trackFilterUsage(userId: string, filters: Record<string, any>) {
    await this.trackEvent('filter_applied', {
      filtersApplied: Object.keys(filters),
      filterValues: filters,
    }, userId);
  }

  async trackPremiumUpgrade(userId: string, plan: string, price: number) {
    await this.trackEvent('premium_upgrade', {
      plan,
      price,
      upgradeTime: Date.now(),
    }, userId);
  }

  async trackNotificationInteraction(userId: string, notificationType: string) {
    await this.trackEvent('notification_clicked', {
      notificationType,
      timeSinceReceived: Date.now(),
    }, userId);
  }

  // Calculate engagement metrics
  async calculateEngagementMetrics(timeRange: 'day' | 'week' | 'month'): Promise<UserEngagementMetrics> {
    // This would typically query your analytics database
    // For now, returning mock data structure
    const now = Date.now();
    const timeRangeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[timeRange];

    // In real implementation, query events from the timeframe
    const mockMetrics: UserEngagementMetrics = {
      dailyActiveUsers: 1250,
      weeklyActiveUsers: 5800,
      monthlyActiveUsers: 18900,
      avgSessionDuration: 342000, // 5.7 minutes in ms
      retentionRate: {
        day1: 0.78,
        day7: 0.45,
        day30: 0.23,
      },
      conversionFunnel: {
        profileViews: 10000,
        likes: 3500,
        matches: 850,
        conversations: 420,
        meetups: 85,
      },
    };

    return mockMetrics;
  }

  // Calculate growth metrics
  async calculateGrowthMetrics(): Promise<GrowthMetrics> {
    const mockGrowthMetrics: GrowthMetrics = {
      newSignups: 145,
      signupConversionRate: 0.23,
      userGrowthRate: 0.085, // 8.5% monthly growth
      churnRate: 0.12,
      averageRevenuePerUser: 12.50,
      lifetimeValue: 89.30,
    };

    return mockGrowthMetrics;
  }

  // A/B Testing support
  async trackABTest(testName: string, variant: string, userId: string) {
    await this.trackEvent('app_opened', {
      abTest: testName,
      variant,
      testStartTime: Date.now(),
    }, userId);
  }

  // Session management
  startNewSession() {
    this.trackEvent('session_end', {
      sessionDuration: Date.now() - this.sessionStartTime,
    });

    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    this.trackEvent('session_start');
  }

  // Real-time dashboard data
  async getDashboardData() {
    const engagement = await this.calculateEngagementMetrics('day');
    const growth = await this.calculateGrowthMetrics();

    return {
      liveUsers: 234,
      todaySignups: growth.newSignups,
      todayMatches: engagement.conversionFunnel.matches,
      todayMessages: 1240,
      conversionRate: engagement.conversionFunnel.matches / engagement.conversionFunnel.profileViews,
      revenueToday: 1850.75,
      topFeatures: [
        { name: 'Group Browse', usage: 0.89 },
        { name: 'Messaging', usage: 0.67 },
        { name: 'Profile Editing', usage: 0.45 },
      ],
    };
  }

  // Cohort analysis
  async getCohortRetention(startDate: string, endDate: string) {
    // Mock cohort data - in real app, this would query the database
    return {
      cohorts: [
        { period: '2024-01', day0: 100, day1: 78, day7: 45, day30: 23 },
        { period: '2024-02', day0: 120, day1: 89, day7: 52, day30: 28 },
        { period: '2024-03', day0: 145, day1: 98, day7: 58, day30: 31 },
      ],
    };
  }

  // Force flush events (useful for app background/foreground)
  async forceFlush() {
    await this.flushEvents();
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStartTime,
      eventCount: this.eventQueue.length,
    };
  }
}

export const analyticsService = new AnalyticsService(); 