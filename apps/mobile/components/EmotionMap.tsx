import { formatDate } from '@/utils/dateUtils';
import { debugGrid, debugMap } from '@/utils/debug';
import { EmotionData } from '@/utils/emotionUtils';
import chroma from 'chroma-js';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface EmotionMapProps {
  data: EmotionData[];
  title?: string;
  onCellPress?: (date: string, intensity: number) => void;
  weeksToShow?: number; // Number of weeks to display horizontally
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Generate a color scale using chroma-js (for backward compatibility)
const colorScale = chroma.scale([
  '#D2F2E3', // peaceful mint green (very low intensity)
  '#E5F5D3', // light mint green (low intensity)
  '#F3F2C9', // light yellow (low-medium intensity)
  '#F7E1B7', // light orange (medium intensity)
  '#FDE2C3', // soft orange (medium-high intensity)
  '#F8C7C8', // gentle pink (high intensity)
  '#F4A9A8', // stronger pink (very high intensity)
  '#EB9A9B'  // soft cherry red (extreme intensity)
]).mode('lab').correctLightness().colors(24); // 24 levels with corrected lightness

/**
 * A calendar-style emotion intensity map
 */
export const EmotionMap = ({
  data,
  title = 'EMOTION MAP',
  onCellPress,
  weeksToShow = 7, // Default to 7 weeks
}: EmotionMapProps) => {
  // Debug data on mount
  useEffect(() => {
    debugMap('EmotionMap received data: %o', data.length > 0 ? data.slice(0, 3) : 'empty');
  }, [data]);
  
  // Process data into a map for easy access
  const emotionMap = useMemo(() => {
    const map = new Map<string, { intensity: number, color: string }>();
    if (data && data.length > 0) {
      data.forEach(item => {
        if (item && item.date) {
          // Normalize date format by removing time part if present
          const dateKey = item.date.split('T')[0];
          map.set(dateKey, { 
            intensity: item.intensity,
            color: item.color || '#E0E0E0', // Fallback color if not provided
          });
        }
      });
    }
    debugMap('Emotion map created with %d dates', map.size);
    return map;
  }, [data]);
  
  // Generate dates for the grid
  const gridData = useMemo(() => {
    debugGrid('Generating grid data with weeks: %d', weeksToShow);
    // Today's date (the last day to show)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset hours to compare dates properly

    // We're going to work directly with today as our end point
    const todayString = formatDate(today);
    
    // Create a new grid structure where each row represents a day of the week
    // and each column represents a specific date
    const grid: Array<Array<{date: string, intensity: number, color: string, isValid: boolean}>> = Array(7).fill(null).map(() => []);
    
    // Calculate total days to show (7 days per week * number of weeks)
    const totalDays = 7 * weeksToShow;
    
    // Generate all dates we need to display, working backward from today
    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      // Start from today and go backward
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - (totalDays - 1 - dayOffset));
      
      // Use local date formatting instead of ISO string
      const dateString = formatDate(cellDate);
      const cellData = emotionMap.get(dateString) || { intensity: 0, color: '#E0E0E0' };
      const isValid = cellDate <= today;
      
      // Figure out which row this date belongs to (based on day of week)
      // Monday is index 0, Sunday is index 6
      let dayIndex = cellDate.getDay() - 1; // Adjust so Monday is 0
      if (dayIndex < 0) dayIndex = 6; // Sunday becomes 6
      
      // Push this date into the appropriate row
      grid[dayIndex].push({
        date: dateString,
        intensity: cellData.intensity,
        color: cellData.color,
        isValid
      });
      
      // Debug log for today
      if (dateString === todayString) {
        debugGrid('Today (%s) is included in the grid at row %d!', dateString, dayIndex);
      }
    }
    
    // Verify today's date is in the grid
    const hasToday = grid.flat().some(cell => cell.date === todayString);
    debugGrid('Grid includes today (%s)? %s', todayString, hasToday ? 'Yes' : 'No');
    
    // Log total cell count
    const totalCells = grid.reduce((sum, row) => sum + row.length, 0);
    debugGrid('Total cells in grid: %d, Expected: %d', totalCells, totalDays);
    
    // Log dates with activity
    const activeDates = grid.flat().filter(cell => cell.intensity > 0).map(cell => cell.date);
    debugGrid('Dates with activity: %o', activeDates.length > 0 ? activeDates : 'none');
    
    return grid;
  }, [emotionMap, weeksToShow]);

  // Get color for a cell (using the new color property or fallback to intensity-based)
  const getCellColor = (cell: { intensity: number, color: string, isValid: boolean }) => {
    if (!cell.isValid) return 'transparent'; // Future dates are transparent
    if (cell.intensity === 0) return '#E5E7EB'; // No data
    
    // Use the color property generated by the emotion algorithm
    if (cell.color) {
      return cell.color;
    }
    
    // Fallback to intensity-based coloring (for backward compatibility)
    debugMap('Using fallback color for intensity: %f', cell.intensity);
    const normalizedIntensity = Math.max(0, Math.min(1, cell.intensity));
    const colorIndex = Math.min(Math.floor(normalizedIntensity * 23), 23);
    return colorScale[colorIndex];
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      
      <View style={styles.mapContainer}>
        {/* Day labels on the left */}
        <View style={styles.dayLabels}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={`day-${index}`} style={styles.dayLabelContainer}>
              <ThemedText type="caption" style={styles.dayLabel}>{day}</ThemedText>
            </View>
          ))}
        </View>
        
        {/* Grid cells */}
        <View style={styles.grid}>
          {gridData.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell) => (
                <TouchableOpacity
                  key={cell.date}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(cell) }
                  ]}
                  onPress={() => cell.isValid && onCellPress?.(cell.date, cell.intensity)}
                  activeOpacity={cell.isValid && onCellPress ? 0.7 : 1}
                  disabled={!cell.isValid}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      
      {/* Debug text - remove in production */}
      {data.length === 0 && (
        <ThemedText type="caption" style={styles.debugMessage}>
          No emotion data available
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: '#637061', // Muted green to match the theme
    letterSpacing: 1,
  },
  mapContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Back to flex-start for proper row alignment
    justifyContent: 'center',
  },
  dayLabels: {
    marginRight: 12,
    height: 238, // Adjust to match exactly the grid height (34px * 7)
    justifyContent: 'flex-start', // Changed from space-between to flex-start
  },
  dayLabelContainer: {
    height: 30,
    marginBottom: 4, // Same as row margin to ensure alignment
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    color: '#9BA599',
    fontWeight: '500',
  },
  grid: {
    height: 238, // Match exactly the dayLabels height
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4, // Reduced margin
    height: 30,
    alignItems: 'center',
  },
  cell: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 8,
  },
  debugMessage: {
    marginTop: 15,
    textAlign: 'center',
    color: '#999',
  },
});

export default EmotionMap; 