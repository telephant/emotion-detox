/**
 * Simple Environment Configuration
 * No nesting, no complex references, just direct exports
 */

// API
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const API_BASE_PATH = process.env.EXPO_PUBLIC_API_BASE_PATH || '/api';

// Environment
export const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
export const IS_DEV = ENVIRONMENT === 'development';

// Storage Keys (fixed values, no env vars needed)
export const JWT_TOKEN_KEY = '@EmotionDetox:jwtToken';
export const ANONYMOUS_ID_KEY = '@EmotionDetox:anonymousId';
export const USER_EMAIL_KEY = '@EmotionDetox:userEmail';
export const IS_ANONYMOUS_KEY = '@EmotionDetox:isAnonymous';

// Debug helper
export const debugLog = (message: string, ...args: any[]) => {
  if (IS_DEV) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};
