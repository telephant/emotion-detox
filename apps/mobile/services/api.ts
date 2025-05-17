import { 
  ApiEndpoints, 
  ApiMethods, 
  API_BASE_PATH, 
  UrgeData, 
  HealthResponse, 
  SingleUrgeResponse, 
  UrgesResponse,
  UrgeStatsResponse,
  UserResponse,
  UserRegistrationData,
  UrgeStatusUpdateData,
} from '@repo/shared-types';

// API base URL
// In development, this should point to your local backend
// In production, this should point to your deployed backend
const API_URL = 'http://localhost:3000';

/**
 * API client for the Emotion Detox app
 */
export const apiClient = {
  /**
   * Health check endpoint
   */
  checkHealth: (): Promise<HealthResponse> => fetchApi(ApiEndpoints.HEALTH),

  /**
   * Get all urges or filter by userId
   */
  getUrges: (userId?: string): Promise<UrgesResponse> => fetchApi(ApiEndpoints.URGES, { params: userId ? { userId } : undefined }),

  /**
   * Delay an urge
   */
  delayUrge: (urgeData: UrgeData): Promise<SingleUrgeResponse> => fetchApi(ApiEndpoints.DELAY_URGE, { method: ApiMethods.POST, body: urgeData }),

  /**
   * Get urge statistics 
   */
  getUrgeStats: (userId?: string): Promise<UrgeStatsResponse> => fetchApi(ApiEndpoints.URGE_STATS, { params: userId ? { userId } : undefined }),

  /**
   * Register a device and create a user
   */
  registerDevice: (deviceId: string): Promise<UserResponse> => fetchApi(ApiEndpoints.REGISTER_DEVICE, { method: ApiMethods.POST, body: { deviceId } }),

  /**
   * Get a user by device ID
   */
  getUserByDeviceId: (deviceId: string): Promise<UserResponse> => fetchApi(ApiEndpoints.USERS, { params: { deviceId } }),

  /**
   * Update the status of an urge
   */
  updateUrgeStatus: (urgeData: UrgeStatusUpdateData): Promise<SingleUrgeResponse> => fetchApi(ApiEndpoints.UPDATE_URGE_STATUS, { method: ApiMethods.POST, body: urgeData })
};

/**
 * Helper function to make API requests
 */
async function fetchApi<T>(endpoint: string, options: { method?: string; params?: Record<string, string | undefined>; body?: unknown } = {}): Promise<T> {
  const { method = ApiMethods.GET, params, body } = options;
  console.log('🚀 ===== method:', method);
  
  // Build URL with query params
  let url = `${API_URL}${API_BASE_PATH}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && queryParams.append(k, v));
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  // Request options
  const requestOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  };
  
  if (body) requestOptions.body = JSON.stringify(body);

  // Make request
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API error');
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
} 