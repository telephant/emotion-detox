import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { usersApi } from '@/api/users';
import { User } from '@repo/shared-types';
import { useAsync } from '@/hooks/useAsync';
import { Alert } from 'react-native';

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Use our async hook for the API calls
  const {
    execute: registerDevice,
    loading: registerLoading,
    error: registerError,
  } = useAsync(usersApi.registerDevice);

  const {
    execute: getUserByDeviceId,
    loading: getUserLoading,
    error: getUserError,
  } = useAsync(usersApi.getUserByDeviceId);

  // Initialize anonymous ID and check for existing user
  useEffect(() => {
    let isMounted = true;

    const initFromStorage = async () => {
      try {
        console.log('� Initializing user data with anonymous auth...');

        // Get or create anonymous ID
        const anonId = await authService.getAnonymousId();
        console.log('� Anonymous ID:', anonId);

        if (isMounted) {
          setAnonymousId(anonId);
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

    initFromStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Register or get user with anonymous ID
  useEffect(() => {
    // Skip if storage initialization hasn't completed
    if (!storageInitialized) return;

    // If we already have a userId, we can finish loading
    if (userId) {
      console.log('👤 Already have user ID, finishing initialization:', userId);
      setIsLoading(false);
      return;
    }

    // Skip if we don't have an anonymousId
    if (!anonymousId) {
      console.log('⚠️ No anonymous ID available, cannot initialize user');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initUser = async () => {
      try {
        // Try to get the user first using anonymous ID as device ID
        try {
          console.log('🔍 Looking up user by anonymous ID:', anonymousId);
          const userResponse = await getUserByDeviceId(anonymousId);

          if (isMounted) {
            console.log('✅ User found by anonymous ID');
            setUser(userResponse.data);
            const newUserId = userResponse.data.id;
            setUserId(newUserId);
            console.log('👤 User found:', newUserId);
          }
        } catch (getUserError) {
          console.log('👤 User not found, registering anonymous user...', getUserError);

          try {
            console.log('🔄 Registering anonymous user with ID:', anonymousId);
            const registrationResponse = await registerDevice(anonymousId);

            if (isMounted) {
              console.log('✅ Anonymous user registration successful');
              setUser(registrationResponse.data);
              const newUserId = registrationResponse.data.id;
              setUserId(newUserId);
              console.log('✅ Anonymous user registered, user ID:', newUserId);
            }
          } catch (registerError) {
            console.error('❌ Failed to register device:', registerError);
            
            if (retryCount < MAX_RETRIES) {
              console.log(`🔄 Retrying registration (${retryCount + 1}/${MAX_RETRIES})...`);
              setRetryCount(prev => prev + 1);
              // Will retry on next effect run due to retryCount change
              if (isMounted) {
                setError(new Error('Failed to register device. Retrying...'));
              }
              return;
            } else {
              // Max retries reached, show error
              if (isMounted) {
                setError(new Error('Failed to register your device after multiple attempts. Please restart the app.'));
                Alert.alert(
                  'Connection Error',
                  'Could not connect to the server. Please check your internet connection and try again.',
                  [{ text: 'OK' }]
                );
              }
            }
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
          
          Alert.alert(
            'Error',
            'There was a problem initializing the app. Please try again later.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    initUser();

    return () => {
      isMounted = false;
    };
  }, [anonymousId, userId, storageInitialized, getUserByDeviceId, registerDevice, retryCount]);

  return {
    userId,
    user,
    anonymousId, // Return anonymousId instead of deviceId
    isLoading: isLoading || registerLoading || getUserLoading,
    error: error || registerError || getUserError,
    // Create a method to retry registration
    retryRegistration: () => {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
      } else {
        setRetryCount(0); // Reset and try again
      }
    }
  };
}