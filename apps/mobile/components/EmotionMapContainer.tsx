import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import EmotionMap from './EmotionMap';
import { ThemedText } from './ThemedText';
import { apiClient } from '@/services/api';
import { Colors } from '@/constants/Colors';
import { useAsync } from '@/hooks/useAsync';
import { Urge, UrgeStatus, DailyStatusCounts } from '@repo/shared-types';
import { getUserId } from '@/services/userStorage';

interface EmotionMapContainerProps {
  weeks?: number;
}

// Calculate weights for different urge statuses
const STATUS_WEIGHTS = {
  [UrgeStatus.PEACEFUL]: 0.1,  // Peaceful is a positive outcome (very low intensity)
  [UrgeStatus.PENDING]: 0.3,   // Pending is a neutral outcome (low-medium intensity)
  [UrgeStatus.PRESENT]: 0.7,   // Still present is a challenging outcome (high intensity)
  [UrgeStatus.OVERCOME]: 1.0,  // Overcome is a negative outcome (very high intensity)
};

export const EmotionMapContainer = ({ 
  weeks = 7
}: EmotionMapContainerProps) => {
  const [emotionData, setEmotionData] = useState<{ date: string; intensity: number }[]>([]);
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
          const processedData = processEmotionMapData(result.data.dailyData);
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
  
  // Process the daily data to calculate emotion intensity
  const processEmotionMapData = (dailyData: DailyStatusCounts[]) => {
    console.log("Processing daily data for emotion map:", dailyData.length, "days");
    
    return dailyData.map(day => {
      // Calculate weighted average of intensities
      let totalWeight = 0;
      let weightedSum = 0;
      
      // Log the counts for this day
      console.log(`Day ${day.date} counts:`, JSON.stringify(day.counts));
      
      Object.entries(STATUS_WEIGHTS).forEach(([status, weight]) => {
        if (day.counts[status] > 0) {
          const statusWeight = day.counts[status] * weight;
          weightedSum += statusWeight;
          totalWeight += day.counts[status];
          console.log(`Status ${status}: count=${day.counts[status]}, weight=${weight}, contribution=${statusWeight}`);
        }
      });
      
      // Calculate final intensity
      let intensity = 0;
      if (totalWeight > 0) {
        // Base intensity from weighted status average
        intensity = weightedSum / totalWeight;
        
        // Apply adjustment based on total count
        // More urges on a day = slightly higher intensity
        const countFactor = Math.min(day.counts.total / 5, 1); // Cap at 5 urges
        
        // Blend the status-based intensity with the count factor
        // Increase the weight of the status to make colors more pronounced
        intensity = intensity * 0.9 + countFactor * 0.1; // 90% status-based, 10% count-based
        
        console.log(`Final intensity for ${day.date}: ${intensity.toFixed(3)} (base: ${(weightedSum / totalWeight).toFixed(3)}, count factor: ${countFactor.toFixed(3)})`);
      }
      
      return {
        date: day.date,
        intensity,
      };
    });
  };
  
  const handleCellPress = (date: string, intensity: number) => {
    setSelectedDate(date);
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