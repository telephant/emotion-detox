import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

interface DelayUrgeButtonProps {
  onPress?: () => void;
}

export default function DelayUrgeButton({ onPress }: DelayUrgeButtonProps) {
  const handlePress = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.delayButton} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.delayButtonText}>Delay Urge</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  delayButton: {
    backgroundColor: Colors.light.primary,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  delayButtonText: {
    color: Colors.light.white,
    fontSize: 24,
    fontWeight: '400',
  },
}); 