/**
 * API response types
 */
import {
  Urge,
  User,
  EmotionMapData,
  Mood,
} from './models';

/**
 * Base response interface 
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Health check response
 */
export interface HealthResponse extends ApiResponse {
  data: {
    status: 'ok';
  };
}

/**
 * User response
 */
export interface UserResponse extends ApiResponse {
  data: User;
}

/**
 * Response for single urge 
 */
export interface SingleUrgeResponse extends ApiResponse {
  data: Urge;
}

/**
 * Response for multiple urges
 */
export interface UrgesResponse extends ApiResponse {
  data: {
    urges: Urge[];
  };
}

/**
 * Response for urge statistics
 */
export interface UrgeStatsResponse extends ApiResponse {
  data: {
    total: number;
    recent: Urge[];
  };
}

/**
 * Response for emotion map data
 */
export interface EmotionMapResponse extends ApiResponse {
  data: EmotionMapData;
}

/**
 * Response for a single mood
 */
export interface MoodResponse extends ApiResponse {
  data: {
    mood: Mood;
  };
}

/**
 * Response for multiple moods
 */
export interface MoodsResponse extends ApiResponse {
  data: {
    moods: Mood[];
  };
} 