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
} from 'react-native';

import Button from '@/components/base/Button';
import DelayUrgeButton from '@/components/DelayUrgeButton';
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
  
  // Separate animation values for countdown and free state
  const countdownFadeAnim = useRef(new Animated.Value(0)).current;
  const countdownSlideAnim = useRef(new Animated.Value(20)).current;
  
  const freeFadeAnim = useRef(new Animated.Value(0)).current;
  const freeSlideAnim = useRef(new Animated.Value(20)).current;

  const textColor = useThemeColor({}, 'textPrimary');
  const {
    isFinished,
    countdownText,
    startCountdown,
    resetCountdown,
  } = useCountdown(120);

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
      
      // Reset and start free state animations
      freeFadeAnim.setValue(0);
      freeSlideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(freeFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(freeSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isFinished]);

  // don't touch this, it's need to be delaying and free.
  const showCountdown = useMemo(() => status === 'delaying' || status === 'free', [status]);
  const showFreeState = useMemo(() => status === 'free', [status]);
  const showTips = useMemo(() => status === 'delaying', [status]);

  const resetAnimationsAndState = () => {
    setStatus('idle');
    resetCountdown();
    countdownFadeAnim.setValue(0);
    countdownSlideAnim.setValue(20);
    freeFadeAnim.setValue(0);
    freeSlideAnim.setValue(20);
  };

  const handlePressPeaceful = resetAnimationsAndState;
  const handlePressUrge = resetAnimationsAndState;
  const handlePressUrgeOver = resetAnimationsAndState;

  return (
    <SafeAreaView style={styles.container}>
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
              <DelayUrgeButton onPress={handleDelayPress} />
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

        {showFreeState && (
          <Animated.View 
            style={[
              styles.freeContainer, 
              { 
                opacity: freeFadeAnim,
                transform: [{ translateY: freeSlideAnim }]
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
        )}

        {/* {status === 'idle' && (
          <View style={styles.moodLogSection}>
            <View style={styles.moodLogHeader}>
              <Text style={styles.sectionTitle}>Mood Log</Text>
              <TouchableOpacity
                style={styles.addMoodButton}
              >
                <FontAwesome name="plus" size={18} color={textColor} />
              </TouchableOpacity>
            </View>

            <MoodEntry
              emoji="😊"
              mood="Lonely"
              date="May 5, 10:34 PM"
              description="Felt like I wanted to reach out..."
            />
          </View>
        )} */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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