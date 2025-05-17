/**
 * API response types
 */
import { Urge, User } from './models';

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