/**
 * Authentication API
 * Pure API calls for authentication endpoints
 */

import { apiClient } from './client';
import { ApiEndpoints } from '@repo/shared-types';

// Types for API requests and responses
export interface RegisterRequest {
  email: string;
  password: string;
  anonymousUserId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email?: string;
    isAnonymous: boolean;
    deviceId: string;
    createTime: number;
    updateTime: number;
  };
  token: string;
  message: string;
}

export interface AuthCheckResponse {
  success: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  user?: {
    userId: string;
    email?: string;
    isAnonymous: boolean;
  };
  message: string;
}

/**
 * Authentication API calls
 */
export const authApi = {
  /**
   * Register a new user with email and password
   */
  register(data: RegisterRequest, authHeaders?: Record<string, string>): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ApiEndpoints.AUTH_REGISTER, data, authHeaders);
  },

  /**
   * Login with email and password
   */
  login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ApiEndpoints.AUTH_LOGIN, data);
  },

  /**
   * Migrate anonymous user to registered account
   */
  migrateAnonymousUser(data: RegisterRequest, authHeaders?: Record<string, string>): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ApiEndpoints.AUTH_MIGRATE, data, authHeaders);
  },

  /**
   * Get current user profile
   */
  getProfile(authHeaders: Record<string, string>): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>(ApiEndpoints.AUTH_PROFILE, undefined, authHeaders);
  },

  /**
   * Refresh JWT token
   */
  refreshToken(authHeaders: Record<string, string>): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ApiEndpoints.AUTH_REFRESH, undefined, authHeaders);
  },

  /**
   * Logout user
   */
  logout(authHeaders: Record<string, string>): Promise<{ success: boolean; message: string }> {
    return apiClient.post(ApiEndpoints.AUTH_LOGOUT, undefined, authHeaders);
  },

  /**
   * Check authentication status
   */
  checkAuth(authHeaders?: Record<string, string>): Promise<AuthCheckResponse> {
    return apiClient.get<AuthCheckResponse>(ApiEndpoints.AUTH_CHECK, undefined, authHeaders);
  },
};
