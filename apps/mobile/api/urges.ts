/**
 * Urges API
 * Pure API calls for urge-related endpoints
 */

import { apiClient } from './client';
import { 
  UrgeData, 
  SingleUrgeResponse, 
  UrgesResponse,
  UrgeStatsResponse,
  UrgeStatusUpdateData,
  EmotionMapResponse,
  ApiEndpoints,
} from '@repo/shared-types';

/**
 * Urges API calls
 */
export const urgesApi = {
  /**
   * Get all urges or filter by userId
   */
  getUrges(userId?: string): Promise<UrgesResponse> {
    const params = userId ? { userId } : undefined;
    return apiClient.get<UrgesResponse>(ApiEndpoints.URGES, params);
  },

  /**
   * Delay an urge
   */
  delayUrge(urgeData: UrgeData): Promise<SingleUrgeResponse> {
    return apiClient.post<SingleUrgeResponse>(ApiEndpoints.DELAY_URGE, urgeData);
  },

  /**
   * Get urge statistics 
   */
  getUrgeStats(userId?: string): Promise<UrgeStatsResponse> {
    const params = userId ? { userId } : undefined;
    return apiClient.get<UrgeStatsResponse>(ApiEndpoints.URGE_STATS, params);
  },

  /**
   * Update the status of an urge
   */
  updateUrgeStatus(urgeData: UrgeStatusUpdateData): Promise<SingleUrgeResponse> {
    return apiClient.post<SingleUrgeResponse>(ApiEndpoints.UPDATE_URGE_STATUS, urgeData);
  },

  /**
   * Get emotion map data for visualization
   */
  getEmotionMapData(userId?: string, weeks?: number): Promise<EmotionMapResponse> {
    const params: Record<string, string | undefined> = {};
    if (userId) params.userId = userId;
    if (weeks) params.weeks = weeks.toString();
    
    return apiClient.get<EmotionMapResponse>(ApiEndpoints.EMOTION_MAP, params);
  },
};
