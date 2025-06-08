const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearAuthData() {
  try {
    console.log('🧹 Clearing authentication data...');
    
    // Clear all auth-related keys
    await AsyncStorage.multiRemove([
      '@remembered_session',
      '@user_data',
      '@profile_data',
      'authState',
      'resetDone'
    ]);
    
    console.log('✅ Authentication data cleared successfully!');
    console.log('📱 The app will now start with a clean login state.');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
}

clearAuthData(); 