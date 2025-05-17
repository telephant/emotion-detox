import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

interface AnimatedTextCyclerProps {
  texts: string[];
  interval?: number;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  onComplete?: () => void;
  repeat?: boolean;
}

export const AnimatedTextCycler: React.FC<AnimatedTextCyclerProps> = ({
  texts,
  interval = 1000,
  textStyle,
  containerStyle,
  onComplete,
  repeat = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0); // Track the current index to avoid stale state
  const isMountedRef = useRef(true);
  
  // Get the actual index to display
  const displayIndex = texts.length > 0 ? currentIndex % texts.length : 0;

  // Clean up function to prevent memory leaks and state updates after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Reset if texts array changes
  useEffect(() => {
    const i = Math.floor(Math.random() * texts.length);
    setCurrentIndex(i);
    indexRef.current = i;
  }, [texts]);
  
  // Handle the cycling of texts
  useEffect(() => {
    // Don't animate if there are no texts
    if (texts.length === 0) return;
    
    // Function to cycle to next text
    const cycleToNextText = () => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isMountedRef.current) return;
        
        // Advance to random index
        indexRef.current = Math.floor(Math.random() * texts.length);
        
        // Handle reaching the end
        if (indexRef.current >= texts.length) {
          if (repeat) {
            indexRef.current = 0;
          } else {
            if (onComplete) onComplete();
            return;
          }
        }
        
        // Update the displayed index
        if (isMountedRef.current) {
          setCurrentIndex(indexRef.current);
          
          // Fade in the next text
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          
          // Schedule next cycle after interval
          scheduleNextCycle();
        }
      });
    };
    
    // Schedule the next cycle with clear timer safety
    const scheduleNextCycle = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (isMountedRef.current) {
        timerRef.current = setTimeout(cycleToNextText, interval);
      }
    };
    
    // Start the cycling
    scheduleNextCycle();
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [texts, interval, repeat, onComplete]);
  
  // Render nothing if no texts
  if (texts.length === 0) return null;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ThemedText style={[styles.text, textStyle]}>
          {texts[displayIndex]}
        </ThemedText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  text: {
    textAlign: 'center',
  },
}); 