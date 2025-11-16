/**
 * Base API Client
 * Handles common API request logic
 */

import { API_URL, API_BASE_PATH, debugLog } from '@/config/env';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | undefined>;
}

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL, basePath: string = API_BASE_PATH) {
    this.baseUrl = `${baseUrl}${basePath}`;
  }

  /**
   * Make an API request
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    debugLog('📡 API Request:', method, url);

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Non-JSON response:', text);
        data = { message: 'Unexpected response format from server' };
      }

      debugLog('📥 API Response:', response.status, data);

      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = data.message || `HTTP error ${response.status}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Could not connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, string | undefined>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, headers });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export a default instance
export const apiClient = new ApiClient();
