import { Colors } from '@/constants/Colors';
import { useAsync } from '@/hooks/useAsync';
import { apiClient } from '@/services/api';
import { getUserId } from '@/services/userStorage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';

interface DelayUrgeButtonProps {
  onPress?: () => void;
  onSuccess?: (id: number) => void;
}

export default function DelayUrgeButton(props: DelayUrgeButtonProps) {
  const { onPress, onSuccess } = props;

  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Use the async hook for API call
  const {
    execute,
    loading,
    error,
  } = useAsync(apiClient.delayUrge, false);

  // Get the userId from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      } catch (err) {
        console.error('Error fetching user ID:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUserId();
  }, []);

  const handlePress = async () => {
    // Only proceed if we have a userId
    if (!userId) {
      console.error('Cannot delay urge - no user ID available');
      return;
    }

    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Define the urge data
    const urgeData = {
      type: 'urge',
      userId,
    };
    
    // Execute the API call with the urge data
    execute(urgeData).then((result) => {
      onSuccess?.(result.data.id)
    });
    
    if (onPress) {
      onPress();
    }
  };

  // If we're still initializing, show a loading indicator
  if (isInitializing) {
    return (
      <View style={styles.delayButton}>
        <ActivityIndicator color={Colors.light.white} size="large" />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.delayButton} 
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading || !userId}
    >
      {loading ? (
        <ActivityIndicator color={Colors.light.white} size="small" />
      ) : (
        <Text style={styles.delayButtonText}>
          Delay Urge
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  delayButton: {
    backgroundColor: Colors.light.primary,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    height: 64,
  },
  delayButtonText: {
    color: Colors.light.white,
    fontSize: 24,
    fontWeight: '400',
  },
}); 