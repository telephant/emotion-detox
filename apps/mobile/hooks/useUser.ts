import { useState, useEffect } from 'react';
import { getDeviceId } from '../services/deviceId';
import { apiClient } from '../services/api';
import { getUserId, storeUserId } from '../services/userStorage';
import { User } from '@repo/shared-types';
import { useAsync } from './useAsync';

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [storageInitialized, setStorageInitialized] = useState(false);

  // Use our async hook for the API calls
  const {
    execute: registerDevice,
    loading: registerLoading,
    error: registerError,
  } = useAsync(apiClient.registerDevice);

  const {
    execute: getUserByDeviceId,
    loading: getUserLoading,
    error: getUserError,
  } = useAsync(apiClient.getUserByDeviceId);

  // First, check for stored userId and deviceId
  useEffect(() => {
    let isMounted = true;

    const initFromStorage = async () => {
      try {
        // Try to get the userId first
        const storedUserId = await getUserId();
        console.log('📱 getUserId() returned:', storedUserId);
        
        // Always get the device ID as well
        const id = await getDeviceId();
        
        if (isMounted) {
          if (storedUserId) {
            setUserId(storedUserId);
            console.log('🔄 Using stored user ID:', storedUserId);
          } else {
            console.log('⚠️ No stored user ID found');
          }
          
          setDeviceId(id);
          console.log('📱 Device ID:', id);
          setStorageInitialized(true);
        }
      } catch (error) {
        console.error('❌ Error getting initial data:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Failed to get initial data'));
          setIsLoading(false);
          setStorageInitialized(true);
        }
      }
    };

    console.log('🔄 Initializing user data from storage');
    initFromStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Then, once we have the device ID but no userId, register or get the user
  useEffect(() => {
    // Skip if storage initialization hasn't completed
    if (!storageInitialized) return;
    
    // If we already have a userId, we can finish loading
    if (userId) {
      console.log('👤 Already have user ID, finishing initialization:', userId);
      setIsLoading(false);
      return;
    }
    
    // Skip if we don't have a deviceId
    if (!deviceId) {
      console.log('⚠️ No device ID available, cannot initialize user');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    
    const initUser = async () => {
      try {
        // Try to get the user first
        try {
          const userResponse = await getUserByDeviceId(deviceId);
          if (isMounted) {
            setUser(userResponse.data);
            const newUserId = userResponse.data.id;
            setUserId(newUserId);
            await storeUserId(newUserId);
            console.log('👤 User found:', newUserId);
          }
        } catch (getUserError) {
          console.log('👤 User not found, registering device...');
          // If the user doesn't exist, register the device
          const registrationResponse = await registerDevice(deviceId);
          if (isMounted) {
            setUser(registrationResponse.data);
            const newUserId = registrationResponse.data.id;
            setUserId(newUserId);
            await storeUserId(newUserId);
            console.log('✅ Device registered, user ID:', newUserId);
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Failed to initialize user'));
          setIsLoading(false);
        }
      }
    };

    initUser();

    return () => {
      isMounted = false;
    };
  }, [deviceId, userId, storageInitialized, getUserByDeviceId, registerDevice]);

  return {
    userId,
    user,
    deviceId,
    isLoading: isLoading || registerLoading || getUserLoading,
    error: error || registerError || getUserError,
  };
} 