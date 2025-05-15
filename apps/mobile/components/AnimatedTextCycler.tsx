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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const displayIndex = texts.length > 0 ? currentIndex % texts.length : 0;
  
  // Animation functions
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeOut = (onComplete: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(onComplete);
  };

  // Handle the cycling of texts
  useEffect(() => {
    // Don't animate if there are no texts
    if (texts.length === 0) return;
    
    // Initial fade in
    fadeIn();
    
    // Schedule the first fade out
    const cycleTexts = () => {
      timerRef.current = setTimeout(() => {
        fadeOut(() => {
          const nextIndex = currentIndex + 1;
          
          // Check if we're at the end of the texts
          if (nextIndex >= texts.length) {
            if (repeat) {
              setCurrentIndex(0);
            } else {
              onComplete?.();
              return; // Stop cycling
            }
          } else {
            setCurrentIndex(nextIndex);
          }
          
          // Fade in the next text
          fadeIn();
          
          // Continue cycling
          cycleTexts();
        });
      }, interval);
    };
    
    cycleTexts();
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, texts, interval, repeat, onComplete]);
  
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