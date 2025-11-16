/**
 * Device Storage
 * Handles local storage of device-related data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANONYMOUS_ID_KEY, debugLog } from '@/config/env';

/**
 * Device storage operations
 */
export const deviceStorage = {
  /**
   * Store anonymous ID
   */
  async setAnonymousId(anonymousId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
      debugLog('✅ Anonymous ID stored:', anonymousId);
    } catch (error) {
      console.error('❌ Error storing anonymous ID:', error);
      throw error;
    }
  },

  /**
   * Get stored anonymous ID
   */
  async getAnonymousId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    } catch (error) {
      console.error('❌ Error getting anonymous ID:', error);
      return null;
    }
  },

  /**
   * Remove anonymous ID
   */
  async removeAnonymousId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANONYMOUS_ID_KEY);
      debugLog('✅ Anonymous ID removed');
    } catch (error) {
      console.error('❌ Error removing anonymous ID:', error);
      throw error;
    }
  },

  /**
   * Clear all device data
   */
  async clearDeviceData(): Promise<void> {
    try {
      await this.removeAnonymousId();
      debugLog('✅ Device data cleared');
    } catch (error) {
      console.error('❌ Error clearing device data:', error);
      throw error;
    }
  },
};
