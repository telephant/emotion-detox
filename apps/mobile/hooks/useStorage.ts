import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_ID: '@EmotionDetox:userId',
};

/**
 * Custom hook for interacting with AsyncStorage
 */
export const useStorage = () => {
  const [error, setError] = useState<Error | null>(null);

  /**
   * Store a value in AsyncStorage
   */
  const storeValue = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`💾 Value saved to storage for key: ${key}`);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error storing value');
      console.error('Error storing value:', error);
      setError(error);
      return false;
    }
  }, []);

  /**
   * Get a value from AsyncStorage
   */
  const getValue = useCallback(async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error retrieving value');
      console.error(`Error getting stored value for key ${key}:`, error);
      setError(error);
      return null;
    }
  }, []);

  /**
   * Remove a value from AsyncStorage
   */
  const removeValue = useCallback(async (key: string): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Value removed from storage for key: ${key}`);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error removing value');
      console.error(`Error removing stored value for key ${key}:`, error);
      setError(error);
      return false;
    }
  }, []);

  return {
    storeValue,
    getValue,
    removeValue,
    error,
  };
}; 