/**
 * Users API
 * Pure API calls for user-related endpoints
 */

import { apiClient } from './client';
import { UserResponse, ApiEndpoints } from '@repo/shared-types';

/**
 * User API calls
 */
export const usersApi = {
  /**
   * Register a device and create a user
   */
  registerDevice(deviceId: string): Promise<UserResponse> {
    return apiClient.post<UserResponse>(ApiEndpoints.REGISTER_DEVICE, { deviceId });
  },

  /**
   * Get a user by device ID
   */
  getUserByDeviceId(deviceId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(ApiEndpoints.USERS, { deviceId });
  },
};
