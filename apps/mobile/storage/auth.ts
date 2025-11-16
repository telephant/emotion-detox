/**
 * Authentication Storage
 * Handles local storage of authentication data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JWT_TOKEN_KEY, ANONYMOUS_ID_KEY, USER_EMAIL_KEY, IS_ANONYMOUS_KEY, debugLog } from '@/config/env';

/**
 * Authentication storage operations
 */
export const authStorage = {
  /**
   * Store JWT token
   */
  async setJwtToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(JWT_TOKEN_KEY, token);
      debugLog('✅ JWT token stored');
    } catch (error) {
      console.error('❌ Error storing JWT token:', error);
      throw error;
    }
  },

  /**
   * Get stored JWT token
   */
  async getJwtToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(JWT_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error getting JWT token:', error);
      return null;
    }
  },

  /**
   * Remove JWT token
   */
  async removeJwtToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JWT_TOKEN_KEY);
      debugLog('✅ JWT token removed');
    } catch (error) {
      console.error('❌ Error removing JWT token:', error);
      throw error;
    }
  },

  /**
   * Store user email
   */
  async setUserEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_EMAIL_KEY, email);
      debugLog('✅ User email stored');
    } catch (error) {
      console.error('❌ Error storing user email:', error);
      throw error;
    }
  },

  /**
   * Get stored user email
   */
  async getUserEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_EMAIL_KEY);
    } catch (error) {
      console.error('❌ Error getting user email:', error);
      return null;
    }
  },

  /**
   * Remove user email
   */
  async removeUserEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_EMAIL_KEY);
      debugLog('✅ User email removed');
    } catch (error) {
      console.error('❌ Error removing user email:', error);
      throw error;
    }
  },

  /**
   * Set anonymous status
   */
  async setAnonymousStatus(isAnonymous: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(IS_ANONYMOUS_KEY, isAnonymous.toString());
      debugLog('✅ Anonymous status set:', isAnonymous);
    } catch (error) {
      console.error('❌ Error setting anonymous status:', error);
      throw error;
    }
  },

  /**
   * Get anonymous status
   */
  async getAnonymousStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(IS_ANONYMOUS_KEY);
      return status === 'true';
    } catch (error) {
      console.error('❌ Error getting anonymous status:', error);
      return true; // Default to anonymous
    }
  },

  /**
   * Store authentication data (token + email + status)
   */
  async setAuthData(token: string, email: string, isAnonymous: boolean = false): Promise<void> {
    try {
      await Promise.all([
        this.setJwtToken(token),
        this.setUserEmail(email),
        this.setAnonymousStatus(isAnonymous),
      ]);
      debugLog('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  },

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        this.removeJwtToken(),
        this.removeUserEmail(),
        this.setAnonymousStatus(true),
      ]);
      debugLog('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      throw error;
    }
  },

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getJwtToken();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
    };
  },
};
