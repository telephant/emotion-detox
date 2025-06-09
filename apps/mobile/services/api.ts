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
  UrgeStatusUpdateData,
  EmotionMapResponse,
  MoodResponse,
  MoodsResponse,
} from '@repo/shared-types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API base URL configuration
// For iOS simulators, localhost refers to the Mac host
// For Android emulators, we need to use 10.0.2.2 to reference the host
// For web, use the current origin or localhost
const DEV_API_URL_IOS = 'http://192.168.86.226:3000';
const DEV_API_URL_ANDROID = 'http://192.168.86.226:3000';
// const DEV_API_URL_WEB = 'http://localhost:3000';
const DEV_API_URL_WEB = 'https://dmoo57gkff.execute-api.eu-north-1.amazonaws.com/prod';
const PROD_API_URL = 'https://emotion-detox-api.yourdomain.com'; // Replace with your production URL

// Determine the API URL based on environment and platform
function getApiUrl() {
  // Check if we're in development or production
  const isDev = !Constants.expoConfig?.extra?.isProduction;
  
  if (isDev) {
    switch (Platform.OS) {
      case 'web':
        return DEV_API_URL_WEB;
      case 'ios':
        return DEV_API_URL_IOS;
      default:
        return DEV_API_URL_ANDROID;
    }
  } else {
    return PROD_API_URL;
  }
}

// Get the API URL
const API_URL = getApiUrl();
console.log('🌐 Using API URL:', API_URL, 'for platform:', Platform.OS);

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
  updateUrgeStatus: (urgeData: UrgeStatusUpdateData): Promise<SingleUrgeResponse> => fetchApi(ApiEndpoints.UPDATE_URGE_STATUS, { method: ApiMethods.POST, body: urgeData }),

  /**
   * Get emotion map data for visualization
   */
  getEmotionMapData: (userId?: string, weeks?: number): Promise<EmotionMapResponse> => {
    const params: Record<string, string | undefined> = {};
    if (userId) params.userId = userId;
    if (weeks) params.weeks = weeks.toString();
    
    console.log('🔍 getEmotionMapData called with userId:', userId, 'weeks:', weeks);
    console.log('🔗 Building request with params:', params);
    
    return fetchApi(ApiEndpoints.EMOTION_MAP, { params });
  },

  /**
   * Get moods for a user
   */
  getUserMoods: (userId: string): Promise<MoodsResponse> => {
    console.log('🔍 getUserMoods called with userId:', userId);
    return fetchApi(`${ApiEndpoints.USER_MOODS}/${userId}`);
  },
  
  /**
   * Get a specific mood
   */
  getMood: (moodId: string): Promise<MoodResponse> => {
    console.log('🔍 getMood called with moodId:', moodId);
    return fetchApi(`${ApiEndpoints.MOODS}/${moodId}`);
  },
  
  /**
   * Create a new mood
   */
  createMood: (data: { userId: string; text: string; emoji?: string }): Promise<MoodResponse> => {
    console.log('🔍 createMood called with data:', data);
    return fetchApi(ApiEndpoints.MOODS, { method: ApiMethods.POST, body: data });
  },
  
  /**
   * Update a mood
   */
  updateMood: (moodId: string, data: { text: string; emoji?: string }): Promise<MoodResponse> => {
    console.log('🔍 updateMood called with moodId:', moodId, 'data:', data);
    return fetchApi(`${ApiEndpoints.MOODS}/${moodId}`, { method: ApiMethods.PUT, body: data });
  },
  
  /**
   * Delete a mood
   */
  deleteMood: (moodId: string): Promise<{ success: boolean; message: string }> => {
    console.log('🔍 deleteMood called with moodId:', moodId);
    return fetchApi(`${ApiEndpoints.MOODS}/${moodId}`, { method: ApiMethods.DELETE });
  }
};

/**
 * Helper function to make API requests
 */
async function fetchApi<T>(endpoint: string, options: { method?: string; params?: Record<string, string | undefined>; body?: unknown } = {}): Promise<T> {
  const { method = ApiMethods.GET, params, body } = options;
  console.log('🚀 ===== method:', method);
  
  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && queryParams.append(k, v));
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }
  
  console.log('📡 Fetching from URL:', url);

  // Request options
  const requestOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  };
  
  if (body) requestOptions.body = JSON.stringify(body);
  
  // Make request
  try {
    console.log('🌐 Request options:', JSON.stringify(requestOptions));
    
    // Check for network connectivity first
    const response = await fetch(url, requestOptions);
    
    // Try to parse response as JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn('Non-JSON response:', text);
      data = { message: 'Unexpected response format from server' };
    }
    
    console.log('📥 Response status:', response.status, 'Response data:', JSON.stringify(data).substring(0, 200));
    
    // Handle HTTP error status codes
    if (!response.ok) {
      let errorMessage = data.message || `HTTP error ${response.status}`;
      
      // Add more context based on status code
      if (response.status === 404) {
        errorMessage = 'Resource not found: ' + errorMessage;
      } else if (response.status === 500) {
        errorMessage = 'Server error: ' + errorMessage;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication error: ' + errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return data as T;
  } catch (error) {
    // Handle network errors separately
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('❌ Network request failed - is the server running?', error);
      throw new Error('Could not connect to the server. Please check your internet connection or try again later.');
    }
    
    console.error('❌ API request failed:', error);
    throw error;
  }
} 