import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Animated,
  ScrollView,
} from 'react-native';

import Button from '@/components/base/Button';
import DelayUrgeButton from '@/components/DelayUrgeButton';
import { ThemedText } from '@/components/ThemedText';
import { TipsSection } from '@/components/TipsSection';
import FreeStateView from '@/components/FreeStateView';
import EmotionMapContainer from '@/components/EmotionMapContainer';
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <EmotionMapContainer />
          )}
        </View>
      </ScrollView>
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
}); 