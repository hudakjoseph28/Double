import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface GroupInvite {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

export interface Group {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  createdAt: string;
  isActive: boolean;
}

class GroupService {
  private static instance: GroupService;
  private invites: Map<string, GroupInvite> = new Map();
  private groups: Map<string, Group> = new Map();
  private userGroups: Map<string, string> = new Map(); // userId -> groupId
  private nextInviteId = 1;
  private nextGroupId = 1;

  static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load existing invites
      const invitesData = await AsyncStorage.getItem('@group_invites');
      const groupsData = await AsyncStorage.getItem('@groups');
      const userGroupsData = await AsyncStorage.getItem('@user_groups');
      const nextInviteId = await AsyncStorage.getItem('@next_invite_id');
      const nextGroupId = await AsyncStorage.getItem('@next_group_id');

      if (invitesData) {
        const parsedInvites = JSON.parse(invitesData);
        this.invites = new Map(Object.entries(parsedInvites));
      }

      if (groupsData) {
        const parsedGroups = JSON.parse(groupsData);
        this.groups = new Map(Object.entries(parsedGroups));
      }

      if (userGroupsData) {
        this.userGroups = new Map(Object.entries(JSON.parse(userGroupsData)));
      }

      if (nextInviteId) {
        this.nextInviteId = parseInt(nextInviteId, 10);
      }

      if (nextGroupId) {
        this.nextGroupId = parseInt(nextGroupId, 10);
      }

      console.log('[GroupService] Initialized with', this.invites.size, 'invites and', this.groups.size, 'groups');
      
      // Create bot groups if in development and no groups exist
      if (__DEV__ && this.groups.size === 0) {
        await this.createBotGroups();
      }
    } catch (error) {
      console.error('[GroupService] Failed to initialize:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('@group_invites', JSON.stringify(Object.fromEntries(this.invites)));
      await AsyncStorage.setItem('@groups', JSON.stringify(Object.fromEntries(this.groups)));
      await AsyncStorage.setItem('@user_groups', JSON.stringify(Object.fromEntries(this.userGroups)));
      await AsyncStorage.setItem('@next_invite_id', this.nextInviteId.toString());
      await AsyncStorage.setItem('@next_group_id', this.nextGroupId.toString());
    } catch (error) {
      console.error('[GroupService] Failed to save to storage:', error);
    }
  }

  private generateInviteId(): string {
    const id = `INV${this.nextInviteId.toString().padStart(6, '0')}`;
    this.nextInviteId++;
    return id;
  }

  private generateGroupId(): string {
    const id = `GRP${this.nextGroupId.toString().padStart(6, '0')}`;
    this.nextGroupId++;
    return id;
  }

  async sendInvite(fromUserId: string, toUserId: string, fromUserName: string, toUserName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if users are already in groups
      if (this.userGroups.has(fromUserId)) {
        return { success: false, error: 'You are already in a group' };
      }

      if (this.userGroups.has(toUserId)) {
        return { success: false, error: 'This user is already in a group' };
      }

      // Check if invite already exists
      const existingInvite = Array.from(this.invites.values()).find(
        invite => invite.fromUserId === fromUserId && invite.toUserId === toUserId && invite.status === 'pending'
      );

      if (existingInvite) {
        return { success: false, error: 'Invite already sent to this user' };
      }

      // Create new invite
      const inviteId = this.generateInviteId();
      const invite: GroupInvite = {
        id: inviteId,
        fromUserId,
        toUserId,
        fromUserName,
        toUserName,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.invites.set(inviteId, invite);
      await this.saveToStorage();

      console.log('[GroupService] Invite sent:', inviteId, 'from', fromUserName, 'to', toUserName);
      return { success: true };
    } catch (error) {
      console.error('[GroupService] Failed to send invite:', error);
      return { success: false, error: 'Failed to send invite' };
    }
  }

  async respondToInvite(inviteId: string, accept: boolean): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      const invite = this.invites.get(inviteId);
      if (!invite) {
        return { success: false, error: 'Invite not found' };
      }

      if (invite.status !== 'pending') {
        return { success: false, error: 'Invite already responded to' };
      }

      // Update invite status
      invite.status = accept ? 'accepted' : 'declined';
      invite.respondedAt = new Date().toISOString();
      this.invites.set(inviteId, invite);

      if (accept) {
        // Create group
        const groupId = this.generateGroupId();
        const group: Group = {
          id: groupId,
          user1Id: invite.fromUserId,
          user2Id: invite.toUserId,
          user1Name: invite.fromUserName,
          user2Name: invite.toUserName,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        this.groups.set(groupId, group);
        this.userGroups.set(invite.fromUserId, groupId);
        this.userGroups.set(invite.toUserId, groupId);

        await this.saveToStorage();

        console.log('[GroupService] Group created:', groupId, 'with', invite.fromUserName, 'and', invite.toUserName);
        return { success: true, groupId };
      } else {
        await this.saveToStorage();
        console.log('[GroupService] Invite declined:', inviteId);
        return { success: true };
      }
    } catch (error) {
      console.error('[GroupService] Failed to respond to invite:', error);
      return { success: false, error: 'Failed to respond to invite' };
    }
  }

  async getPendingInvites(userId: string): Promise<GroupInvite[]> {
    return Array.from(this.invites.values()).filter(
      invite => invite.toUserId === userId && invite.status === 'pending'
    );
  }

  async getSentInvites(userId: string): Promise<GroupInvite[]> {
    return Array.from(this.invites.values()).filter(
      invite => invite.fromUserId === userId
    );
  }

  async getUserGroup(userId: string): Promise<Group | null> {
    const groupId = this.userGroups.get(userId);
    if (!groupId) return null;
    return this.groups.get(groupId) || null;
  }

  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(group => group.isActive);
  }

  async leaveGroup(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const groupId = this.userGroups.get(userId);
      if (!groupId) {
        return { success: false, error: 'You are not in a group' };
      }

      const group = this.groups.get(groupId);
      if (!group) {
        return { success: false, error: 'Group not found' };
      }

      // Mark group as inactive
      group.isActive = false;
      this.groups.set(groupId, group);

      // Remove users from group mapping
      this.userGroups.delete(group.user1Id);
      this.userGroups.delete(group.user2Id);

      await this.saveToStorage();

      console.log('[GroupService] User left group:', userId, 'from group', groupId);
      return { success: true };
    } catch (error) {
      console.error('[GroupService] Failed to leave group:', error);
      return { success: false, error: 'Failed to leave group' };
    }
  }

  async createBotGroups(): Promise<void> {
    try {
      // Create 15 bot groups (pairs of bots) - excluding Joey's account (DD000001)
      const botPairs = [
        ['DD000003', 'DD000004'], // testuser03 + testuser04
        ['DD000005', 'DD000006'], // testuser05 + testuser06
        ['DD000007', 'DD000008'], // testuser07 + testuser08
        ['DD000009', 'DD000010'], // testuser09 + testuser10
        ['DD000011', 'DD000012'], // testuser11 + testuser12
        ['DD000013', 'DD000014'], // testuser13 + testuser14
        ['DD000015', 'DD000016'], // testuser15 + testuser16
        ['DD000017', 'DD000018'], // testuser17 + testuser18
        ['DD000019', 'DD000020'], // testuser19 + testuser20
        ['DD000021', 'DD000022'], // testuser21 + testuser22
        ['DD000023', 'DD000024'], // testuser23 + testuser24
        ['DD000025', 'DD000026'], // testuser25 + testuser26
        ['DD000027', 'DD000028'], // testuser27 + testuser28
        ['DD000029', 'DD000030'], // testuser29 + testuser30
        ['DD000031', 'DD000032'], // Additional bots to maintain 15 groups
      ];

      const botNames = [
        ['Emma Thompson', 'Olivia Kim'],
        ['Ava Martinez', 'Mia Johnson'],
        ['Charlotte Davis', 'Amelia Wilson'],
        ['Harper Brown', 'Evelyn Garcia'],
        ['Abigail Miller', 'Emily Taylor'],
        ['Elizabeth Anderson', 'Sofia Thomas'],
        ['Avery Jackson', 'Liam Anderson'],
        ['Noah Williams', 'Oliver Jones'],
        ['Elijah Brown', 'William Davis'],
        ['James Miller', 'Benjamin Wilson'],
        ['Lucas Moore', 'Henry Taylor'],
        ['Alexander Lee', 'Mason White'],
        ['Michael Harris', 'Ethan Martin'],
        ['Daniel Thompson', 'Matthew Garcia'],
        ['Ryan Cooper', 'Tyler Brooks'], // New pair to replace removed Joey pair
      ];

      for (let i = 0; i < botPairs.length; i++) {
        const [user1Id, user2Id] = botPairs[i];
        const [user1Name, user2Name] = botNames[i];

        const groupId = this.generateGroupId();
        const group: Group = {
          id: groupId,
          user1Id,
          user2Id,
          user1Name,
          user2Name,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
          isActive: true,
        };

        this.groups.set(groupId, group);
        this.userGroups.set(user1Id, groupId);
        this.userGroups.set(user2Id, groupId);
      }

      await this.saveToStorage();
      console.log('[GroupService] Created 15 bot groups for testing');
    } catch (error) {
      console.error('[GroupService] Failed to create bot groups:', error);
    }
  }

  async clearAllData(): Promise<void> {
    this.invites.clear();
    this.groups.clear();
    this.userGroups.clear();
    this.nextInviteId = 1;
    this.nextGroupId = 1;
    await AsyncStorage.multiRemove(['@group_invites', '@groups', '@user_groups', '@next_invite_id', '@next_group_id']);
    console.log('[GroupService] All group data cleared');
  }

  // Debug function
  async getDebugInfo(): Promise<{ totalInvites: number; totalGroups: number; activeGroups: number }> {
    const activeGroups = Array.from(this.groups.values()).filter(group => group.isActive);
    return {
      totalInvites: this.invites.size,
      totalGroups: this.groups.size,
      activeGroups: activeGroups.length,
    };
  }
}

export default GroupService; 