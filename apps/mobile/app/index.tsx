import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '@/components/base/Button';
import DelayUrgeButton from '@/components/DelayUrgeButton';
import MoodEntry from '@/components/MoodEntry';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useCountdown } from '@/hooks/useCountdown';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';


type Status = 'delaying' | 'idle' | 'free';

export default function HomeScreen() {
  const [status, setStatus] = useState<Status>('idle');

  const textColor = useThemeColor({}, 'textPrimary');
  const { isFinished, countdownText, startCountdown } = useCountdown(5);

  const handleDelayPress = () => {
    setStatus('delaying');
    startCountdown();
  };

  useEffect(() => {
    if (isFinished) {
      setStatus('free');
    }
  }, [isFinished]);

  const showCountdown = useMemo(() => status === 'delaying' || status === 'free', [status]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerBody}>
        <View style={styles.header}>
          <ThemedText type="title">Emotion Detox</ThemedText>
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
              <FontAwesome name="hourglass-half" size={24} color={textColor} />
              <ThemedText type="subtitle" fontSize={20}>
                Taking a moment...
              </ThemedText>
            </View>
          </>
        )}

        {showCountdown && (
          <View style={styles.urgeContainer}>
            <FontAwesome name="hourglass-half" size={100} color={textColor} />
            <ThemedText type="subtitle" fontSize={40}>{countdownText}</ThemedText>
            <ThemedText type="subtitle" fontSize={20}>
              Take 2 minutes before acting
            </ThemedText>
          </View>
        )}

        {status === 'free' && (
          <View style={styles.freeContainer}>
            <ThemedText type="subtitle" fontSize={30}>
              You&apos;re free to act now
            </ThemedText>
            <View style={styles.buttonContainer}>
              <Button onPress={() => setStatus('idle')} fullWidth>
                <ThemedText type="subtitle" fontSize={20}>
                  ☀️ Peaceful Now
                </ThemedText>
              </Button>
              <Button type="secondary" onPress={() => setStatus('idle')} fullWidth>
                <ThemedText type="subtitle" fontSize={20}>
                  🌀 Urge&apos;s Still Here
                </ThemedText>
              </Button>
              <Button type="danger" onPress={() => setStatus('idle')} fullWidth>
                <ThemedText type="subtitle" fontSize={20} color={Colors.light.white}>
                  😫 Urge Took Over
                </ThemedText>
              </Button>
            </View>
          </View>
        )}

        {status === 'idle' && (
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
        )}

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
    padding: 40,
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
    paddingTop: '20%',
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