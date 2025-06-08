import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface User {
  userId: string;
  email: string;
  username: string;
  password: string; // In production, this would be hashed
  displayName: string;
  createdAt: string;
  lastLogin: string;
  isProfileComplete: boolean;
  inGroup: boolean;
  groupId?: string;
  rememberMe: boolean;
}

export interface CreateAccountData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

class UserService {
  private static instance: UserService;
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId mapping
  private nextUserId = 1;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load existing users from storage
      const usersData = await AsyncStorage.getItem('@users_database');
      const emailMapping = await AsyncStorage.getItem('@email_mapping');
      const nextId = await AsyncStorage.getItem('@next_user_id');

      if (usersData) {
        const parsedUsers = JSON.parse(usersData);
        this.users = new Map(Object.entries(parsedUsers));
      }

      if (emailMapping) {
        this.usersByEmail = new Map(Object.entries(JSON.parse(emailMapping)));
      }

      if (nextId) {
        this.nextUserId = parseInt(nextId, 10);
      }

      // Create 30 bot users for testing (only in development)
      if (__DEV__ && this.users.size === 0) {
        await this.create30BotUsers();
      }
    } catch (error) {
      console.error('[UserService] Failed to initialize:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('@users_database', JSON.stringify(Object.fromEntries(this.users)));
      await AsyncStorage.setItem('@email_mapping', JSON.stringify(Object.fromEntries(this.usersByEmail)));
      await AsyncStorage.setItem('@next_user_id', this.nextUserId.toString());
    } catch (error) {
      console.error('[UserService] Failed to save to storage:', error);
    }
  }

  private generateUserId(): string {
    const id = `DD${this.nextUserId.toString().padStart(6, '0')}`;
    this.nextUserId++;
    return id;
  }

  async createAccount(data: CreateAccountData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if email already exists
      if (this.usersByEmail.has(data.email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Check if username already exists
      const existingUser = Array.from(this.users.values()).find(
        user => user.username.toLowerCase() === data.username.toLowerCase()
      );
      if (existingUser) {
        return { success: false, error: 'This username is already taken' };
      }

      // Generate unique user ID
      const userId = this.generateUserId();
      const now = new Date().toISOString();

      // Create new user
      const newUser: User = {
        userId,
        email: data.email.toLowerCase(),
        username: data.username,
        password: data.password, // In production, hash this
        displayName: data.displayName,
        createdAt: now,
        lastLogin: now,
        isProfileComplete: false,
        inGroup: false,
        rememberMe: false,
      };

      // Store user
      this.users.set(userId, newUser);
      this.usersByEmail.set(data.email.toLowerCase(), userId);

      // Save to storage
      await this.saveToStorage();

      return { success: true, user: newUser };
    } catch (error) {
      console.error('[UserService] Account creation failed:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userId = this.usersByEmail.get(email.toLowerCase());
      if (!userId) {
        return { success: false, error: 'No account found with this email' };
      }

      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'Account data not found' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Incorrect password' };
      }

      // Update last login and remember me preference
      user.lastLogin = new Date().toISOString();
      user.rememberMe = rememberMe;
      this.users.set(userId, user);
      await this.saveToStorage();

      return { success: true, user };
    } catch (error) {
      console.error('[UserService] Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) return false;

      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);
      await this.saveToStorage();

      return true;
    } catch (error) {
      console.error('[UserService] Failed to update user:', error);
      return false;
    }
  }

  async markProfileComplete(userId: string): Promise<boolean> {
    return this.updateUser(userId, { isProfileComplete: true });
  }

  async joinGroup(userId: string, groupId: string): Promise<boolean> {
    return this.updateUser(userId, { inGroup: true, groupId });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async clearAllData(): Promise<void> {
    this.users.clear();
    this.usersByEmail.clear();
    this.nextUserId = 1;
    await AsyncStorage.multiRemove(['@users_database', '@email_mapping', '@next_user_id']);
  }

  async createSampleUsers(): Promise<void> {
    const sampleUsers = [
      {
        email: 'emma.wilson@example.com',
        username: 'emmaw',
        displayName: 'Emma Wilson',
        password: 'password123'
      },
      {
        email: 'james.smith@example.com',
        username: 'jamessmith',
        displayName: 'James Smith',
        password: 'password123'
      },
      {
        email: 'sarah.johnson@example.com',
        username: 'sarahj',
        displayName: 'Sarah Johnson',
        password: 'password123'
      },
      {
        email: 'mike.brown@example.com',
        username: 'mikeb',
        displayName: 'Mike Brown',
        password: 'password123'
      },
      {
        email: 'alex.davis@example.com',
        username: 'alexd',
        displayName: 'Alex Davis',
        password: 'password123'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = this.usersByEmail.get(userData.email.toLowerCase());
      if (!existingUser) {
        await this.createAccount(userData);
      }
    }
  }

  async create30BotUsers(): Promise<void> {
    const botUsers = [
      // Female bots 1-15
      { username: 'testuser01', email: 'test01@double.com', displayName: 'Sophia Chen', age: '24', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser02', email: 'test02@double.com', displayName: 'Isabella Rodriguez', age: '26', gender: 'Woman', orientation: 'Bisexual' },
      { username: 'testuser03', email: 'test03@double.com', displayName: 'Emma Thompson', age: '23', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser04', email: 'test04@double.com', displayName: 'Olivia Kim', age: '28', gender: 'Woman', orientation: 'Lesbian' },
      { username: 'testuser05', email: 'test05@double.com', displayName: 'Ava Martinez', age: '25', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser06', email: 'test06@double.com', displayName: 'Mia Johnson', age: '27', gender: 'Woman', orientation: 'Pansexual' },
      { username: 'testuser07', email: 'test07@double.com', displayName: 'Charlotte Davis', age: '24', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser08', email: 'test08@double.com', displayName: 'Amelia Wilson', age: '29', gender: 'Woman', orientation: 'Bisexual' },
      { username: 'testuser09', email: 'test09@double.com', displayName: 'Harper Brown', age: '22', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser10', email: 'test10@double.com', displayName: 'Evelyn Garcia', age: '26', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser11', email: 'test11@double.com', displayName: 'Abigail Miller', age: '25', gender: 'Woman', orientation: 'Lesbian' },
      { username: 'testuser12', email: 'test12@double.com', displayName: 'Emily Taylor', age: '27', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser13', email: 'test13@double.com', displayName: 'Elizabeth Anderson', age: '24', gender: 'Woman', orientation: 'Bisexual' },
      { username: 'testuser14', email: 'test14@double.com', displayName: 'Sofia Thomas', age: '28', gender: 'Woman', orientation: 'Straight' },
      { username: 'testuser15', email: 'test15@double.com', displayName: 'Avery Jackson', age: '23', gender: 'Woman', orientation: 'Pansexual' },
      
      // Male bots 16-30
      { username: 'testuser16', email: 'test16@double.com', displayName: 'Liam Anderson', age: '26', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser17', email: 'test17@double.com', displayName: 'Noah Williams', age: '28', gender: 'Man', orientation: 'Gay' },
      { username: 'testuser18', email: 'test18@double.com', displayName: 'Oliver Jones', age: '25', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser19', email: 'test19@double.com', displayName: 'Elijah Brown', age: '27', gender: 'Man', orientation: 'Bisexual' },
      { username: 'testuser20', email: 'test20@double.com', displayName: 'William Davis', age: '24', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser21', email: 'test21@double.com', displayName: 'James Miller', age: '29', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser22', email: 'test22@double.com', displayName: 'Benjamin Wilson', age: '26', gender: 'Man', orientation: 'Gay' },
      { username: 'testuser23', email: 'test23@double.com', displayName: 'Lucas Moore', age: '23', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser24', email: 'test24@double.com', displayName: 'Henry Taylor', age: '28', gender: 'Man', orientation: 'Pansexual' },
      { username: 'testuser25', email: 'test25@double.com', displayName: 'Alexander Lee', age: '25', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser26', email: 'test26@double.com', displayName: 'Mason White', age: '27', gender: 'Man', orientation: 'Bisexual' },
      { username: 'testuser27', email: 'test27@double.com', displayName: 'Michael Harris', age: '24', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser28', email: 'test28@double.com', displayName: 'Ethan Martin', age: '26', gender: 'Man', orientation: 'Gay' },
      { username: 'testuser29', email: 'test29@double.com', displayName: 'Daniel Thompson', age: '29', gender: 'Man', orientation: 'Straight' },
      { username: 'testuser30', email: 'test30@double.com', displayName: 'Matthew Garcia', age: '25', gender: 'Man', orientation: 'Straight' },
    ];

    const prompts = [
      "What's your ideal first date?",
      "What's something you're passionate about?",
      "What's your biggest goal right now?",
      "What's your love language?",
      "What's something that makes you laugh?",
      "What's your favorite way to spend a weekend?",
      "What's something you're learning?",
      "What's your biggest adventure?",
    ];

    const promptAnswers = [
      "Coffee and a walk through the city, discovering hidden gems",
      "Photography and capturing life's beautiful moments",
      "Building meaningful connections with amazing people",
      "Quality time and deep conversations",
      "Spontaneous adventures and good friends",
      "Exploring new places and trying new foods",
      "Learning to cook dishes from different cultures",
      "Backpacking through Europe last summer",
      "A cozy bookstore followed by dinner somewhere new",
      "Traveling and experiencing different cultures",
      "Starting my own creative business",
      "Acts of service and thoughtful gestures",
      "Dad jokes and witty banter",
      "Hiking in nature and disconnecting from technology",
      "Playing guitar and writing music",
      "Solo traveling to Japan and learning the language",
      "Mini golf and ice cream - classic but fun",
      "Fitness and helping others reach their goals",
      "Buying my first home",
      "Words of affirmation and genuine compliments",
      "Unexpected moments and silly situations",
      "Farmers markets and cooking together",
      "Spanish and planning a trip to South America",
      "Climbing Mount Whitney with my best friends",
    ];

    const hometowns = [
      'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX',
      'Seattle, WA', 'Denver, CO', 'Portland, OR', 'Boston, MA', 'Miami, FL',
      'Nashville, TN', 'Atlanta, GA', 'Phoenix, AZ', 'San Diego, CA', 'Philadelphia, PA',
      'Minneapolis, MN', 'Charlotte, NC', 'Tampa, FL', 'Dallas, TX', 'Washington, DC',
      'Boulder, CO', 'Asheville, NC', 'Santa Barbara, CA', 'Charleston, SC', 'Savannah, GA',
      'Burlington, VT', 'Madison, WI', 'Ann Arbor, MI', 'Eugene, OR', 'Missoula, MT'
    ];

    const schools = [
      'Stanford University', 'Harvard University', 'MIT', 'UC Berkeley', 'UCLA',
      'University of Chicago', 'Columbia University', 'NYU', 'University of Texas',
      'University of Washington', 'University of Colorado', 'Portland State',
      'Boston University', 'University of Miami', 'Vanderbilt University',
      'Emory University', 'Arizona State University', 'UC San Diego', 'UPenn',
      'University of Minnesota', 'UNC Chapel Hill', 'University of South Florida',
      'SMU', 'Georgetown University', 'University of Colorado Boulder',
      'UNC Asheville', 'UC Santa Barbara', 'College of Charleston', 'SCAD',
      'University of Vermont'
    ];

    // Placeholder profile photos from reliable sources
    const femalePhotos = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=500&fit=crop&crop=face'
    ];

    const malePhotos = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=500&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=500&fit=crop&crop=face'
    ];

    const heights = ["5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""];
    const religions = ['Christian', 'Agnostic', 'Atheist', 'Spiritual', 'Jewish', 'Other'];
    const drinking = ['Socially', 'Rarely', 'Never', 'Regularly'];
    const smoking = ['Never', 'Rarely', 'Socially'];
    const intentions = ['Relationship', 'Something casual', 'New friends', 'Still figuring it out'];

    for (let i = 0; i < botUsers.length; i++) {
      const bot = botUsers[i];
      const existingUser = this.usersByEmail.get(bot.email.toLowerCase());
      
      if (!existingUser) {
        // Create the basic account
        const result = await this.createAccount({
          email: bot.email,
          username: bot.username,
          displayName: bot.displayName,
          password: `pw${(i + 1).toString().padStart(2, '0')}` // pw01, pw02, etc.
        });

        if (result.success && result.user) {
          // Mark profile as complete and update with full profile data
          await this.updateUser(result.user.userId, {
            isProfileComplete: true,
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random login within last week
          });

          // Determine photos based on gender
          const isFemale = i < 15; // First 15 are female
          const photoArray = isFemale ? femalePhotos : malePhotos;
          const photoIndex = i % photoArray.length;
          
          // Store complete profile data in AsyncStorage
          const profileData = {
            photos: [
              photoArray[photoIndex],
              photoArray[(photoIndex + 1) % photoArray.length],
              photoArray[(photoIndex + 2) % photoArray.length]
            ],
            prompts: [
              { 
                question: prompts[Math.floor(Math.random() * prompts.length)], 
                answer: promptAnswers[Math.floor(Math.random() * promptAnswers.length)]
              },
              { 
                question: prompts[Math.floor(Math.random() * prompts.length)], 
                answer: promptAnswers[Math.floor(Math.random() * promptAnswers.length)]
              },
              { 
                question: prompts[Math.floor(Math.random() * prompts.length)], 
                answer: promptAnswers[Math.floor(Math.random() * promptAnswers.length)]
              },
            ],
            age: bot.age,
            height: heights[Math.floor(Math.random() * heights.length)],
            gender: bot.gender,
            orientation: bot.orientation,
            religion: religions[Math.floor(Math.random() * religions.length)],
            drinking: drinking[Math.floor(Math.random() * drinking.length)],
            smoking: smoking[Math.floor(Math.random() * smoking.length)],
            friendly420: Math.random() > 0.7,
            monogamy: Math.random() > 0.3,
            hometown: hometowns[i % hometowns.length],
            school: schools[i % schools.length],
            intention: intentions[Math.floor(Math.random() * intentions.length)],
            displayName: bot.displayName,
            email: bot.email,
            username: bot.username,
            userId: result.user.userId,
          };

          // Store profile data with user-specific key
          await AsyncStorage.setItem(`@profile_data_${result.user.userId}`, JSON.stringify(profileData));
        }
      }
    }

    console.log('[UserService] 30 bot users created with complete profiles and photos for testing');
  }

  async getBotUserCredentials(): Promise<Array<{ username: string; email: string; password: string; displayName: string }>> {
    const botCredentials = [];
    
    for (let i = 1; i <= 30; i++) {
      const email = `test${i.toString().padStart(2, '0')}@double.com`;
      const userId = this.usersByEmail.get(email);
      
      if (userId) {
        const user = this.users.get(userId);
        if (user) {
          botCredentials.push({
            username: user.username,
            email: user.email,
            password: `pw${i.toString().padStart(2, '0')}`,
            displayName: user.displayName
          });
        }
      }
    }
    
    return botCredentials;
  }

  // Debug function to check bot user status
  async debugBotUsers(): Promise<{ totalUsers: number; botUsers: number; sampleBots: any[] }> {
    const allUsers = await this.getAllUsers();
    const botUsers = allUsers.filter(user => user.email.includes('@double.com'));
    
    const sampleBots = botUsers.slice(0, 5).map(user => ({
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      isProfileComplete: user.isProfileComplete
    }));

    return {
      totalUsers: allUsers.length,
      botUsers: botUsers.length,
      sampleBots
    };
  }

  // Validation helpers
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  }

  static validateUsername(username: string): { valid: boolean; message?: string } {
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  }
}

export default UserService; 