/**
 * Authentication Service
 * Business logic that combines API calls, storage, and utilities
 */

import { authApi, AuthResponse } from '@/api/auth';
import { authStorage } from '@/storage/auth';
import { deviceStorage } from '@/storage/device';
import { generateAnonymousId } from '@/utils/device';
import { debugLog } from '@/config/env';

/**
 * Authentication service that orchestrates auth flow
 */
export const authService = {
  /**
   * Get or create an anonymous user ID
   */
  async getAnonymousId(): Promise<string> {
    try {
      debugLog('🔍 Checking for existing anonymous ID...');
      const existingId = await deviceStorage.getAnonymousId();
      
      if (existingId) {
        debugLog('✅ Found existing anonymous ID:', existingId);
        return existingId;
      }
      
      // Generate new anonymous ID
      const newAnonymousId = generateAnonymousId();
      debugLog('🆕 Generated new anonymous ID:', newAnonymousId);
      
      // Store the new ID and mark as anonymous
      await Promise.all([
        deviceStorage.setAnonymousId(newAnonymousId),
        authStorage.setAnonymousStatus(true),
      ]);
      
      debugLog('💾 Anonymous ID saved to storage');
      return newAnonymousId;
    } catch (error) {
      console.error('❌ Error managing anonymous ID:', error);
      // Fallback to generating a temporary ID
      return generateAnonymousId();
    }
  },

  /**
   * Check if the current user is anonymous
   */
  async isAnonymousUser(): Promise<boolean> {
    try {
      const isAnonymous = await authStorage.getAnonymousStatus();
      const jwtToken = await authStorage.getJwtToken();
      
      // User is anonymous if explicitly marked as such and has no JWT token
      return isAnonymous && !jwtToken;
    } catch (error) {
      console.error('❌ Error checking anonymous status:', error);
      return true; // Default to anonymous if we can't determine
    }
  },

  /**
   * Get the current user identifier (anonymous ID or authenticated user ID)
   */
  async getCurrentUserId(): Promise<string> {
    try {
      const isAnonymous = await this.isAnonymousUser();
      
      if (isAnonymous) {
        return await this.getAnonymousId();
      } else {
        // For authenticated users, we might store the actual user ID separately
        // For now, return the anonymous ID that will be migrated
        const anonymousId = await deviceStorage.getAnonymousId();
        return anonymousId || await this.getAnonymousId();
      }
    } catch (error) {
      console.error('❌ Error getting current user ID:', error);
      return await this.getAnonymousId();
    }
  },

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, migrateData: boolean = true): Promise<AuthResponse> {
    try {
      const anonymousUserId = migrateData ? await this.getCurrentUserId() : undefined;
      const authHeaders = await authStorage.getAuthHeaders();
      
      const response = await authApi.register({
        email,
        password,
        anonymousUserId,
      }, authHeaders);
      
      // Store authentication data
      await authStorage.setAuthData(response.token, email, false);
      
      debugLog('✅ User registered successfully');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.login({ email, password });
      
      // Store authentication data
      await authStorage.setAuthData(response.token, email, false);
      
      debugLog('✅ User logged in successfully');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      debugLog('🚪 Logging out user...');
      
      // Try to call logout endpoint (optional, since JWT is stateless)
      try {
        const authHeaders = await authStorage.getAuthHeaders();
        await authApi.logout(authHeaders);
      } catch (error) {
        console.warn('Logout API call failed, continuing with local logout:', error);
      }
      
      // Clear authentication data and revert to anonymous
      await authStorage.clearAuthData();
      
      debugLog('✅ User logged out, reverted to anonymous');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const authHeaders = await authStorage.getAuthHeaders();
      return await authApi.getProfile(authHeaders);
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      throw error;
    }
  },

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const authHeaders = await authStorage.getAuthHeaders();
      const response = await authApi.refreshToken(authHeaders);
      
      // Update stored token
      const email = await authStorage.getUserEmail();
      if (email) {
        await authStorage.setAuthData(response.token, email, false);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      throw error;
    }
  },

  /**
   * Check authentication status
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; isAnonymous: boolean }> {
    try {
      const authHeaders = await authStorage.getAuthHeaders();
      const response = await authApi.checkAuth(authHeaders);
      
      return {
        isAuthenticated: response.isAuthenticated,
        isAnonymous: response.isAnonymous,
      };
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      return {
        isAuthenticated: false,
        isAnonymous: true,
      };
    }
  },

  /**
   * Clear all data (for testing or complete reset)
   */
  async clearAllData(): Promise<void> {
    try {
      debugLog('🗑️ Clearing all authentication data...');
      
      await Promise.all([
        authStorage.clearAuthData(),
        deviceStorage.clearDeviceData(),
      ]);
      
      debugLog('✅ All authentication data cleared');
    } catch (error) {
      console.error('❌ Error clearing authentication data:', error);
      throw error;
    }
  },
};
