import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing the user ID in AsyncStorage
export const USER_ID_KEY = '@EmotionDetox:userId';

/**
 * Store user ID in AsyncStorage
 */
export const storeUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log('💾 User ID saved to storage:', userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
  }
};

/**
 * Get user ID from AsyncStorage
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId;
  } catch (error) {
    console.error('Error getting stored user ID:', error);
    return null;
  }
}; 