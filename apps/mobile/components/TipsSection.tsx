import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedTextCycler } from './AnimatedTextCycler';
import { Colors } from '@/constants/Colors';

const MINDFULNESS_TIPS = [
  '💦 Take a glass of water',
  '🎶 Listen to your favorite calming song',
  '🚶‍♂️ Walk around for a minute',
  '🌬️ Take 3 deep breaths',
  '✍️ Write down what you’re feeling',
  '🧍 Stretch your arms and back',
  '🕯️ Light a candle or smell something soothing',
  '📵 Put your phone down for 1 minute',
  '👁️ Close your eyes and count to 10',
  '☁️ Look out the window and notice 3 things',
  '🖐️ Press your palms together and relax',
  '📓 Journal one sentence about your mood',
  '💭 Think of one thing you’re grateful for',
  '🐢 Slow your breathing', 
  '🌱 Touch something natural(plant, wood, stone)',
  '📷 Look at a photo that makes you smile',
  '🔄 Change your physical position',
  '💫 Say “This feeling will pass”',
  '🎨 Doodle something abstract',
  '🧘‍♀️ Sit still and listen to ambient sounds',
];

interface TipsSectionProps {
  visible?: boolean;
}

export const TipsSection: React.FC<TipsSectionProps> = ({ 
  visible = true 
}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <AnimatedTextCycler
        texts={MINDFULNESS_TIPS}
        interval={2000}
        textStyle={styles.tipText}
        containerStyle={styles.tipContainer}
        repeat={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: Colors.light.primary + '10', // 10% opacity
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 80,
  },
  tipText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    color: Colors.light.primary,
  },
}); 