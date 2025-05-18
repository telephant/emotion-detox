import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Button from '@/components/base/Button';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAsync } from '@/hooks/useAsync';
import { apiClient } from '@/services/api';
import { UrgeStatus } from '@repo/shared-types';
import { getUserId } from '@/services/userStorage';

interface FreeStateViewProps {
  id: number;
  visible: boolean;
  onPressPeaceful: () => void;
  onPressUrge: () => void;
  onPressUrgeOver: () => void;
}

export const FreeStateView = ({
  id,
  visible,
  onPressPeaceful,
  onPressUrge,
  onPressUrgeOver,
}: FreeStateViewProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [userId, setUserId] = useState<string | null>(null);

  const {
    execute,
    loading,
    error,
  } = useAsync(apiClient.updateUrgeStatus, false);
  
  // Fetch user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    
    fetchUserId();
  }, []);
  
  useEffect(() => {
    if (visible) {
      // Reset and start animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handlePressPeaceful = () => {
    if (!userId) {
      console.error('Cannot update urge - no user ID available');
      return;
    }
    
    execute({
      id,
      userId,
      status: UrgeStatus.PEACEFUL,
    });
    onPressPeaceful();
    slideAnim.setValue(20);
  }

  const handlePressUrge = () => {
    if (!userId) {
      console.error('Cannot update urge - no user ID available');
      return;
    }
    
    execute({
      id,
      userId,
      status: UrgeStatus.PRESENT,
    });
    onPressUrge();
    slideAnim.setValue(20);
  }

  const handlePressUrgeOver = () => {
    if (!userId) {
      console.error('Cannot update urge - no user ID available');
      return;
    }
    
    execute({
      id,
      userId,
      status: UrgeStatus.OVERCOME,
    });
    onPressUrgeOver();
    slideAnim.setValue(20);
  }

  if (!visible || !userId) return null;

  return (
    <Animated.View 
      style={[
        styles.freeContainer, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ThemedText type="subtitle" fontSize={30}>
        You&apos;re free to act now
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Button onPress={handlePressPeaceful} fullWidth>
          <ThemedText type="subtitle" fontSize={20}>
            ☀️ Peaceful Now
          </ThemedText>
        </Button>
        <Button type="secondary" onPress={handlePressUrge} fullWidth>
          <ThemedText type="subtitle" fontSize={20}>
            🌀 Urge&apos;s Still Here
          </ThemedText>
        </Button>
        <Button type="danger" onPress={handlePressUrgeOver} fullWidth>
          <ThemedText type="subtitle" fontSize={20} color={Colors.light.white}>
            😫 Urge Took Over
          </ThemedText>
        </Button>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  freeContainer: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    gap: 40,
  },
  buttonContainer: {
    display: 'flex',
    gap: 20,
  },
});

export default FreeStateView; 