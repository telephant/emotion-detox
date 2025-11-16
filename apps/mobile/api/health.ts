/**
 * Health API
 * Pure API calls for health check endpoints
 */

import { apiClient } from './client';
import { HealthResponse, ApiEndpoints } from '@repo/shared-types';

/**
 * Health API calls
 */
export const healthApi = {
  /**
   * Health check endpoint
   */
  checkHealth(): Promise<HealthResponse> {
    return apiClient.get<HealthResponse>(ApiEndpoints.HEALTH);
  },
};
