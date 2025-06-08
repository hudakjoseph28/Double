import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Users, Bot } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

interface GroupChat {
  id: string;
  groupName: string;
  lastMessage: string;
  timestamp: string;
  memberCount: number;
  avatar: string;
  unreadCount?: number;
  isAIAssistant?: boolean;
  isPinned?: boolean;
}

const mockChats: GroupChat[] = [
  {
    id: 'chat123',
    groupName: 'Double Date Squad',
    lastMessage: '7 PM works for me! Can\'t wait to meet you all 🎉',
    timestamp: new Date(Date.now() - 1000000).toISOString(),
    memberCount: 4,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    unreadCount: 2,
    isAI: true
  },
  {
    id: 'chat-dev-ai',
    groupName: 'Joey & AI Assistant',
    lastMessage: 'Hey, ready to double?',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    memberCount: 2,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    unreadCount: 1,
    isAI: true
  },
  {
    id: 'chat-ai-ai',
    groupName: 'AI Coordination',
    lastMessage: 'Confirmed.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    memberCount: 2,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isAI: true
  },
  {
    id: 'chat456',
    groupName: 'Weekend Adventures',
    lastMessage: 'Anyone up for hiking this Saturday?',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    memberCount: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isAI: true
  },
  {
    id: 'chat789',
    groupName: 'Foodies Unite',
    lastMessage: 'That restaurant was amazing! Thanks for the rec',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    memberCount: 4,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isAI: true
  },
];

export default function MessagesScreen() {
  const [chats, setChats] = useState<GroupChat[]>([]);
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadChats();
  }, [currentUser]);

  const loadChats = async () => {
    try {
      const isDemoMode = await AsyncStorage.getItem('@demo_mode');
      const isDevMode = await AsyncStorage.getItem('@dev_mode');
      
      // Check if this is the demo account
      const isDemoAccount = currentUser?.email === 'demo@doubledate.com';
      const isDevAccount = currentUser?.email === 'testing@gmail.com';
      
      if (isDemoAccount || isDevAccount) {
        console.log('🤖 Loading AI assistant chat for demo/dev account');
        
        // For demo/dev accounts, show ONLY the AI Assistant chat
        const assistantChatId = isDemoAccount 
          ? `demo_assistant_${currentUser.userId}`
          : `dev_assistant_${currentUser.userId}`;
        
        const chatData = await AsyncStorage.getItem(`@chat_${assistantChatId}`);
        
        if (chatData) {
          const parsedChat = JSON.parse(chatData);
          console.log('✅ Found AI assistant chat data:', parsedChat.groupName);
          
          const aiAssistantChat: GroupChat = {
            id: assistantChatId,
            groupName: parsedChat.groupName || '📘 DoubleDate AI Assistant',
            lastMessage: parsedChat.lastMessage || 'Welcome to DoubleDate! I\'m here to help you explore.',
            timestamp: new Date(parsedChat.lastMessageTime || Date.now()).toISOString(),
            memberCount: 2,
            avatar: '🤖',
            unreadCount: parsedChat.unreadCount || 1,
            isAIAssistant: true,
            isPinned: true
          };
          
          setChats([aiAssistantChat]);
        } else {
          console.log('❌ No AI assistant chat found, creating default');
          
          const aiAssistantChat: GroupChat = {
            id: assistantChatId,
            groupName: '📘 DoubleDate AI Assistant',
            lastMessage: '👋 Welcome to DoubleDate! I can help you understand how this app works, navigate features, and answer technical questions.',
            timestamp: new Date().toISOString(),
            memberCount: 2,
            avatar: '🤖',
            unreadCount: 1,
            isAIAssistant: true,
            isPinned: true
          };
          
          setChats([aiAssistantChat]);
        }
        
        console.log('[Messages] Demo/Dev mode: showing only AI Assistant chat');
      } else {
        console.log('📱 Loading regular chats for non-demo/dev account');
        
        // Regular chats for non-demo accounts
        setChats([
          {
            id: 'chat123',
            groupName: 'Double Date Squad',
            lastMessage: '7 PM works for me! Can\'t wait to meet you all 🎉',
            timestamp: new Date(Date.now() - 1000000).toISOString(),
            memberCount: 4,
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
            unreadCount: 2,
          },
          {
            id: 'chat-dev-ai',
            groupName: 'Joey & AI Assistant',
            lastMessage: 'Hey, ready to double?',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            memberCount: 2,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            unreadCount: 1,
          },
          {
            id: 'chat-ai-ai',
            groupName: 'AI Coordination',
            lastMessage: 'Confirmed.',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            memberCount: 2,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          },
        ]);
        console.log('[Messages] Regular mode: showing all chats');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    }
  };

  const formatTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderChatItem = ({ item }: { item: GroupChat }) => (
    <Pressable 
      style={[
        styles.chatContainer,
        item.isPinned && styles.pinnedChat,
        item.isAIAssistant && styles.aiAssistantChat
      ]}
      onPress={() => router.push(`/(tabs)/messages/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        {item.isAIAssistant ? (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        ) : (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
        <View style={[styles.memberCountBadge, item.isAIAssistant && styles.aiMemberBadge]}>
          {item.isAIAssistant ? (
            <Bot size={10} color="#fff" />
          ) : (
            <Users size={10} color="#fff" />
          )}
          <Text style={styles.memberCountText}>{item.memberCount}</Text>
        </View>
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameContainer}>
            {item.isPinned && (
              <Text style={styles.pinnedIcon}>📌</Text>
            )}
            <Text style={styles.groupName} numberOfLines={1}>
              {item.groupName}
            </Text>
            {item.isAIAssistant && (
              <Text style={styles.aiLabel}>AI</Text>
            )}
          </View>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, item.isAIAssistant && styles.aiUnreadBadge]}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start swiping in the Double tab to make matches and begin conversations!
      </Text>
    </View>
  );

  // Check if this is demo or dev mode
  const isDemoOrDevMode = currentUser?.email === 'demo@doubledate.com' || currentUser?.email === 'testing@gmail.com';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {isDemoOrDevMode 
            ? 'AI Assistant Available - Ask me anything!' 
            : chats.length > 0 
              ? `${chats.length} active conversation${chats.length === 1 ? '' : 's'}` 
              : 'No conversations yet'
          }
        </Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={chats.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
  },
  listContent: {
    paddingTop: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pinnedChat: {
    backgroundColor: '#f8f9ff',
  },
  aiAssistantChat: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  aiAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: {
    fontSize: 24,
  },
  memberCountBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  aiMemberBadge: {
    backgroundColor: '#4CAF50',
  },
  memberCountText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinnedIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  groupName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  aiLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.textLight,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  aiUnreadBadge: {
    backgroundColor: '#4CAF50',
  },
  unreadCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 