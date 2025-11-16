import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { AuthResponse } from '@/api/auth';

export interface AuthUser {
  id: string;
  email?: string;
  isAnonymous: boolean;
  deviceId: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, migrateData?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  getCurrentUserId: () => Promise<string>;
}

/**
 * Authentication hook that manages user authentication state
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAnonymous: true,
    isLoading: true,
    error: null,
  });

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🔄 Initializing authentication state...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check authentication status
      const authStatus = await authService.checkAuth();

      if (authStatus.isAuthenticated && !authStatus.isAnonymous) {
        // User is authenticated, get profile
        try {
          const profileResponse = await authService.getProfile();
          setState({
            user: profileResponse.user,
            isAuthenticated: true,
            isAnonymous: false,
            isLoading: false,
            error: null,
          });
          console.log('✅ User authenticated:', profileResponse.user.email);
        } catch (error) {
          // Token might be expired, revert to anonymous
          console.warn('Failed to get profile, reverting to anonymous:', error);
          await authService.logout();
          const anonymousId = await authService.getCurrentUserId();
          setState({
            user: { id: anonymousId, isAnonymous: true, deviceId: anonymousId },
            isAuthenticated: false,
            isAnonymous: true,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // User is anonymous
        const anonymousId = await authService.getCurrentUserId();
        setState({
          user: { id: anonymousId, isAnonymous: true, deviceId: anonymousId },
          isAuthenticated: false,
          isAnonymous: true,
          isLoading: false,
          error: null,
        });
        console.log('👤 User is anonymous:', anonymousId);
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
      }));
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', email);
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.login(email, password);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isAnonymous: false,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Register with email and password
   */
  const register = useCallback(async (email: string, password: string, migrateData: boolean = true) => {
    try {
      console.log('📝 Registering user:', email, 'Migrate data:', migrateData);
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.register(email, password, migrateData);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isAnonymous: false,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Registration successful');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out user...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.logout();

      // Revert to anonymous user
      const anonymousId = await authService.getCurrentUserId();
      setState({
        user: { id: anonymousId, isAnonymous: true, deviceId: anonymousId },
        isAuthenticated: false,
        isAnonymous: true,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Logout successful, reverted to anonymous');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  }, []);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Get current user ID (works for both anonymous and authenticated users)
   */
  const getCurrentUserId = useCallback(async (): Promise<string> => {
    return await authService.getCurrentUserId();
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    getCurrentUserId,
  };
}
