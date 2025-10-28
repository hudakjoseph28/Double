const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearAuthData() {
  try {
    
    // Clear all auth-related keys
    await AsyncStorage.multiRemove([
      '@remembered_session',
      '@user_data',
      '@profile_data',
      'authState',
      'resetDone'
    ]);
    
  } catch (error) {
  }
}

clearAuthData(); 