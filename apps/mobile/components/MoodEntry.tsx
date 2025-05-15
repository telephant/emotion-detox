import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

interface MoodEntryProps {
  emoji: string;
  mood: string;
  date: string;
  description: string;
}

export default function MoodEntry({ emoji, mood, date, description }: MoodEntryProps) {
  return (
    <View style={styles.moodEntry}>
      <View style={styles.moodRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.mood}>{mood}</Text>
        <Text style={styles.date}>— {date}</Text>
      </View>
      <Text style={styles.moodDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  moodEntry: {
    marginBottom: 15,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  mood: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  date: {
    fontSize: 24,
    color: Colors.light.textSecondary,
    marginLeft: 5,
  },
  moodDescription: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    marginLeft: 34,
  },
}); 