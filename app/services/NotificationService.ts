import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Simple event emitter for React Native
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  off(event: string, listener: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationType = 
  | 'new_like' 
  | 'new_match' 
  | 'new_message' 
  | 'group_invitation'
  | 'profile_view';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  groupId?: string;
  userId?: string;
}

class NotificationService extends SimpleEventEmitter {
  private expoPushToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<string | null> {
    try {
      if (Platform.OS === 'android' && !Device.isDevice) {
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      this.expoPushToken = token;
      
      // Set up notification listeners
      this.setupNotificationListeners();

      this.emit('tokenUpdate', token);

      return token;
    } catch (error) {
      return null;
    }
  }

  private setupNotificationListeners() {
    // Notification received while app is running
    Notifications.addNotificationReceivedListener((notification: any) => {
      this.emit('notificationReceived', notification);
    });

    // Notification tapped/opened
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      this.handleNotificationTap(response);
    });
  }

  private handleNotificationTap(response: any) {
    const data = response.notification.request.content.data;
    
    switch (data?.type) {
      case 'new_like':
        // Navigate to likes screen
        this.emit('navigateToLikes', data);
        break;
      case 'new_match':
        // Navigate to matches screen
        this.emit('navigateToMatches', data);
        break;
      case 'new_message':
        // Navigate to conversation
        this.emit('navigateToConversation', data);
        break;
      case 'group_invitation':
        // Navigate to group invite
        this.emit('navigateToGroupInvite', data);
        break;
      default:
    }
  }

  // Send local notification (for demo/testing)
  async sendLocalNotification(notificationData: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
    }
  }

  // Send push notification to specific user (requires backend)
  async sendPushNotification(
    targetExpoPushToken: string, 
    notificationData: NotificationData
  ) {
    const message = {
      to: targetExpoPushToken,
      sound: 'default',
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data || {},
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return null;
    }
  }

  // Predefined notification templates
  async sendLikeNotification(fromUserName: string, groupName: string) {
    await this.sendLocalNotification({
      type: 'new_like',
      title: '💖 New Like!',
      body: `${fromUserName} liked your group "${groupName}"`,
      data: { fromUserName, groupName },
    });
  }

  async sendMatchNotification(matchedGroupName: string) {
    await this.sendLocalNotification({
      type: 'new_match',
      title: '🎉 It\'s a Match!',
      body: `You matched with ${matchedGroupName}! Start chatting now.`,
      data: { matchedGroupName },
    });
  }

  async sendMessageNotification(fromUserName: string, messagePreview: string) {
    await this.sendLocalNotification({
      type: 'new_message',
      title: `💬 ${fromUserName}`,
      body: messagePreview,
      data: { fromUserName, messagePreview },
    });
  }

  async sendGroupInviteNotification(fromUserName: string, groupName: string) {
    await this.sendLocalNotification({
      type: 'group_invitation',
      title: '👥 Group Invitation',
      body: `${fromUserName} invited you to join "${groupName}"`,
      data: { fromUserName, groupName },
    });
  }

  async sendProfileViewNotification(viewerName: string) {
    await this.sendLocalNotification({
      type: 'profile_view',
      title: '👀 Profile View',
      body: `${viewerName} viewed your profile`,
      data: { viewerName },
    });
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Get notification badge count
  async getBadgeCount(): Promise<number> {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  }

  // Set notification badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Get push token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const notificationService = new NotificationService(); 