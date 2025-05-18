/**
 * API endpoint and request definitions
 */
import { UrgeData, UrgeStatus, UserRegistrationData } from './models';
import { 
  HealthResponse,
  SingleUrgeResponse,
  UrgesResponse,
  UrgeStatsResponse,
  UserResponse,
  EmotionMapResponse,
} from './responses';

/**
 * API base path
 */
export const API_BASE_PATH = '/api';

/**
 * API endpoints as string literals
 */
export const ApiEndpoints = {
  HEALTH: '/health',
  URGES: '/urges',
  DELAY_URGE: '/urges/delay',
  URGE_STATS: '/urges/stats',
  USERS: '/users',
  REGISTER_DEVICE: '/users/register',
  UPDATE_URGE_STATUS: '/urges/update',
  EMOTION_MAP: '/urges/emotion-map',
} as const;

/**
 * API methods as string literals
 */
export const ApiMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

/**
 * Health check endpoint definition
 * GET /api/health
 */
export interface HealthEndpoint {
  method: typeof ApiMethods.GET;
  response: HealthResponse;
}

/**
 * Get urges endpoint definition
 * GET /api/urges?userId=optional
 */
export interface GetUrgesEndpoint {
  method: typeof ApiMethods.GET;
  params?: {
    userId?: string;
  };
  response: UrgesResponse;
}

/**
 * Delay urge endpoint definition
 * POST /api/urges/delay
 */
export interface DelayUrgeEndpoint {
  method: typeof ApiMethods.POST;
  body: UrgeData;
  response: SingleUrgeResponse;
}

/**
 * Get urge statistics endpoint definition
 * GET /api/urges/stats?userId=optional
 */
export interface GetUrgeStatsEndpoint {
  method: typeof ApiMethods.GET;
  params?: {
    userId?: string;
  };
  response: UrgeStatsResponse;
}

/**
 * Register device endpoint definition
 * POST /api/users/register
 */
export interface RegisterDeviceEndpoint {
  method: typeof ApiMethods.POST;
  body: UserRegistrationData;
  response: UserResponse;
}

/**
 * Get user by device ID endpoint definition
 * GET /api/users?deviceId=string
 */
export interface GetUserEndpoint {
  method: typeof ApiMethods.GET;
  params: {
    deviceId: string;
  };
  response: UserResponse;
}

/**
 * Update urge status endpoint definition
 * POST /api/urges/update
 */
export interface UpdateUrgeStatusEndpoint {
  method: typeof ApiMethods.POST;
  body: {
    id: number;
    status: UrgeStatus;
    userId?: string;
  };
  response: SingleUrgeResponse;
}

/**
 * Get emotion map data endpoint definition
 * GET /api/urges/emotion-map?userId=optional&weeks=optional
 */
export interface GetEmotionMapEndpoint {
  method: typeof ApiMethods.GET;
  params?: {
    userId?: string;
    weeks?: number;
  };
  response: EmotionMapResponse;
}

/**
 * Complete API definition mapping endpoints to their types
 */
export interface ApiDefinition {
  [ApiEndpoints.HEALTH]: HealthEndpoint;
  [ApiEndpoints.URGES]: GetUrgesEndpoint;
  [ApiEndpoints.DELAY_URGE]: DelayUrgeEndpoint;
  [ApiEndpoints.URGE_STATS]: GetUrgeStatsEndpoint;
  [ApiEndpoints.REGISTER_DEVICE]: RegisterDeviceEndpoint;
  [ApiEndpoints.USERS]: GetUserEndpoint;
  [ApiEndpoints.UPDATE_URGE_STATUS]: UpdateUrgeStatusEndpoint;
  [ApiEndpoints.EMOTION_MAP]: GetEmotionMapEndpoint;
} 