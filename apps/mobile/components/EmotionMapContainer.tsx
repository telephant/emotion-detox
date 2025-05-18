import { Colors } from '@/constants/Colors';
import { useAsync } from '@/hooks/useAsync';
import { apiClient } from '@/services/api';
import { getUserId } from '@/services/userStorage';
import { EmotionData, processEmotionData } from '@/utils/emotionUtils';
import { DailyStatusCounts, UrgeStatus } from '@repo/shared-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EmotionMap } from './EmotionMap';
import { ThemedText } from './ThemedText';

interface EmotionMapContainerProps {
  weeks?: number;
  onCellPress?: () => void; // Callback to notify parent component to scroll
}

export const EmotionMapContainer = ({ 
  weeks = 7,
  onCellPress
}: EmotionMapContainerProps) => {
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [dailyBreakdown, setDailyBreakdown] = useState<Map<string, DailyStatusCounts>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { execute, loading, error } = useAsync(apiClient.getEmotionMapData, false);
  
  // Get the userId from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      } catch (err) {
        console.error('Error fetching user ID:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUserId();
  }, []);
  
  useEffect(() => {
    // Only fetch data once we have a userId
    if (!userId || isInitializing) return;
    
    const fetchData = async () => {
      try {
        const result = await execute(userId, weeks);
        if (result?.data?.dailyData) {
          // Process the data for the emotion map
          const processedData = processEmotionData(result.data.dailyData);
          setEmotionData(processedData);
          
          // Create a map for quick date lookup
          const breakdownMap = new Map<string, DailyStatusCounts>();
          result.data.dailyData.forEach(dayData => {
            breakdownMap.set(dayData.date, dayData);
          });
          setDailyBreakdown(breakdownMap);
        }
      } catch (err) {
        console.error('Error fetching emotion map data:', err);
      }
    };
    
    fetchData();
  }, [userId, weeks, execute, isInitializing]);
  
  const handleCellPress = (date: string, intensity: number) => {
    setSelectedDate(date);
    
    // Call the parent's onCellPress callback after a short delay to allow rendering
    if (onCellPress) {
      setTimeout(() => {
        onCellPress();
      }, 100);
    }
  };
  
  // Render status breakdown for selected date
  const renderStatusBreakdown = () => {
    if (!selectedDate || !dailyBreakdown.has(selectedDate)) return null;
    
    const dayData = dailyBreakdown.get(selectedDate)!;
    
    return (
      <View style={styles.breakdownContainer}>
        <ThemedText type="caption" style={styles.breakdownTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </ThemedText>
        <View style={styles.statusCounts}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#D2F2E3' }]} />
            <ThemedText type="caption">{`Peaceful: ${dayData.counts[UrgeStatus.PEACEFUL] || 0}`}</ThemedText>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#E5F5D3' }]} />
            <ThemedText type="caption">{`Pending: ${dayData.counts[UrgeStatus.PENDING] || 0}`}</ThemedText>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F7E1B7' }]} />
            <ThemedText type="caption">{`Still Present: ${dayData.counts[UrgeStatus.PRESENT] || 0}`}</ThemedText>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F4A9A8' }]} />
            <ThemedText type="caption">{`Urge Took Over: ${dayData.counts[UrgeStatus.OVERCOME] || 0}`}</ThemedText>
          </View>
        </View>
        <ThemedText type="caption" style={styles.totalLabel}>
          {`Total urges: ${dayData.counts.total || 0}`}
        </ThemedText>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {loading || isInitializing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <ThemedText type="caption">Loading your emotion data...</ThemedText>
        </View>
      ) : error || !userId ? (
        <View style={styles.errorContainer}>
          <ThemedText type="caption" color={Colors.light.danger}>
            Couldn&apos;t load emotion data
          </ThemedText>
        </View>
      ) : (
        <>
          <EmotionMap 
            data={emotionData}
            onCellPress={handleCellPress}
          />
          {renderStatusBreakdown()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.light.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  breakdownContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  breakdownTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  statusCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  totalLabel: {
    fontWeight: '500',
    marginTop: 4,
  },
});

export default EmotionMapContainer; 