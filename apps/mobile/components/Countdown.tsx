import {
  View,
  StyleSheet,
} from 'react-native';
import { useCountdown } from '../hooks/useCountdown';
import { ThemedText } from './ThemedText';
interface CountdownProps {
  seconds: number;
}

export default function Countdown(props: CountdownProps) {
  const { isFinished, countdownText } = useCountdown(props.seconds);

  return (
    <View>
      <ThemedText type="subtitle">{countdownText}</ThemedText>
    </View>
  );
}