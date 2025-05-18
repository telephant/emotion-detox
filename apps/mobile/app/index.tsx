import { router } from 'expo-router';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import DelayUrgeButton from '@/components/DelayUrgeButton';
import { EmotionMapContainer } from '@/components/EmotionMapContainer';
import { FreeStateView } from '@/components/FreeStateView';
import { ThemedText } from '@/components/ThemedText';
import { TipsSection } from '@/components/TipsSection';
import { Colors } from '@/constants/Colors';
import { useCountdown } from '@/hooks/useCountdown';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
// import MoodEntry from '@/components/MoodEntry';

type Status = 'delaying' | 'idle' | 'free';

export default function HomeScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [urgeId, setUrgeId] = useState<number | null>(null);

  // Animation for countdown state
  const countdownFadeAnim = useRef(new Animated.Value(0)).current;
  const countdownSlideAnim = useRef(new Animated.Value(20)).current;
  
  // Add a ref for scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Create a ref to identify the emotion map section in the scroll view
  const emotionMapRef = useRef<View>(null);

  const textColor = useThemeColor({}, 'textPrimary');
  const {
    isFinished,
    countdownText,
    startCountdown,
    resetCountdown,
  } = useCountdown(5);

  const handleDelayPress = () => {
    setStatus('delaying');
    startCountdown();
    
    // Reset and start countdown animations
    countdownFadeAnim.setValue(0);
    countdownSlideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(countdownFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(countdownSlideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    if (isFinished) {
      setStatus('free');
    }
  }, [isFinished]);

  // don't touch this, it's need to be delaying and free.
  const showCountdown = useMemo(() => status === 'delaying' || status === 'free', [status]);
  const showFreeState = useMemo(() => status === 'free' && !!urgeId, [status, urgeId]);
  const showTips = useMemo(() => status === 'delaying', [status]);

  const resetAnimationsAndState = () => {
    setStatus('idle');
    setUrgeId(null);
    resetCountdown();
    countdownFadeAnim.setValue(0);
    countdownSlideAnim.setValue(20);
  };

  const handlePressPeaceful = resetAnimationsAndState;
  const handlePressUrge = resetAnimationsAndState;
  const handlePressUrgeOver = resetAnimationsAndState;

  const navigateToMoodList = () => {
    router.push('/moods');
  };
  
  // Function to scroll to the emotion map section
  const scrollToEmotionMap = () => {
    if (scrollViewRef.current && emotionMapRef.current) {
      // Give time for any state changes to be reflected in the UI
      setTimeout(() => {
        emotionMapRef.current?.measureLayout(
          // @ts-ignore - This is a known issue with the types, but the function exists
          scrollViewRef.current,
          (left, top) => {
            scrollViewRef.current?.scrollTo({ y: top, animated: true });
          },
          () => console.error('Failed to measure layout')
        );
      }, 50);
    }
  };
  
  // Enhanced scroll function for emotion map details
  const scrollToEmotionMapDetails = () => {
    if (scrollViewRef.current) {
      // Use a larger delay for the details section to ensure it's rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerBody}>
          <View style={styles.header}>
            <ThemedText type="title">Still the Want</ThemedText>
            <ThemedText
              type="subtitle"
              color={Colors.light.primary}
              fontWeight="200"
            >
              Pause. Feel. Let go.
            </ThemedText>
          </View>

          {status === 'idle' && (
            <>
              <View style={styles.urgeBtnContainer}>
                <DelayUrgeButton
                  onPress={handleDelayPress}
                  onSuccess={setUrgeId}
                />
              </View>

              <View style={styles.timerContainer}>
                <ThemedText type="subtitle" fontSize={20}>
                  🧘 Taking a moment...
                </ThemedText>
              </View>
            </>
          )}

          {showCountdown && (
            <Animated.View 
              style={[
                styles.urgeContainer, 
                { 
                  opacity: countdownFadeAnim,
                  transform: [{ translateY: countdownSlideAnim }]
                }
              ]}
            >
              <FontAwesome name="hourglass-half" size={100} color={textColor} />
              <ThemedText type="subtitle" fontSize={40}>{countdownText}</ThemedText>
              <ThemedText type="subtitle" fontSize={20}>
                Take 2 minutes before acting
              </ThemedText>
            </Animated.View>
          )}

          {/* Show mindfulness tips separately from the animated containers */}
          {showTips && (
            <View style={styles.tipsContainer}>
              <TipsSection />
            </View>
          )}

          {urgeId && (
            <FreeStateView 
              id={urgeId}
              visible={showFreeState}
              onPressPeaceful={handlePressPeaceful}
              onPressUrge={handlePressUrge}
              onPressUrgeOver={handlePressUrgeOver}
            />
          )}
          
          {/* Activity heatmap at the bottom */}
          {status === 'idle' && (
            <View 
              style={styles.mapSection}
              ref={emotionMapRef}
            >
              <TouchableOpacity 
                style={styles.mapHeaderButton}
                onPress={scrollToEmotionMap}
              >
                <ThemedText type="subtitle" fontSize={18}>Activity Overview</ThemedText>
                <FontAwesome name="chevron-down" size={16} color={Colors.light.textPrimary} />
              </TouchableOpacity>
              <EmotionMapContainer 
                onCellPress={scrollToEmotionMapDetails}
              />
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating action button to navigate to mood list */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={navigateToMoodList}
        activeOpacity={0.8}
      >
        <FontAwesome name="smile-o" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  containerBody: {
    flex: 1,
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
    gap: 20,
    display: 'flex',
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: Colors.light.textSecondary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 10,
  },
  tipsContainer: {
    marginTop: 30,
  },
  moodLogSection: {
    marginTop: 20,
  },
  moodLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  addMoodButton: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgeBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgeContainer: {
    display: 'flex',
    paddingTop: 20,
    alignItems: 'center',
    gap: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  mapSection: {
    marginTop: 40,
  },
  mapHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
}); 