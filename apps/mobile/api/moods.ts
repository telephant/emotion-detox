/**
 * Moods API
 * Pure API calls for mood-related endpoints
 */

import { apiClient } from './client';
import { 
  MoodResponse,
  MoodsResponse,
  ApiEndpoints,
} from '@repo/shared-types';

/**
 * Moods API calls
 */
export const moodsApi = {
  /**
   * Get moods for a user
   */
  getUserMoods(userId: string): Promise<MoodsResponse> {
    return apiClient.get<MoodsResponse>(`${ApiEndpoints.USER_MOODS}/${userId}`);
  },
  
  /**
   * Get a specific mood
   */
  getMood(moodId: string): Promise<MoodResponse> {
    return apiClient.get<MoodResponse>(`${ApiEndpoints.MOODS}/${moodId}`);
  },
  
  /**
   * Create a new mood
   */
  createMood(data: { userId: string; text: string; emoji?: string }): Promise<MoodResponse> {
    return apiClient.post<MoodResponse>(ApiEndpoints.MOODS, data);
  },
  
  /**
   * Update a mood
   */
  updateMood(moodId: string, data: { text: string; emoji?: string }): Promise<MoodResponse> {
    return apiClient.put<MoodResponse>(`${ApiEndpoints.MOODS}/${moodId}`, data);
  },
  
  /**
   * Delete a mood
   */
  deleteMood(moodId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${ApiEndpoints.MOODS}/${moodId}`);
  }
};
