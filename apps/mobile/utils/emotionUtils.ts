import { DailyStatusCounts, UrgeStatus } from '@repo/shared-types';
import { debugEmotion } from './debug';
import { EmotionCounts, getEmotionColor } from './colorUtils';

/**
 * Weights for different urge statuses to calculate emotion intensity
 */
export const STATUS_WEIGHTS = {
  [UrgeStatus.PEACEFUL]: 0.1,  // Peaceful is a positive outcome (very low intensity)
  [UrgeStatus.PENDING]: 0.3,   // Pending is a neutral outcome (low-medium intensity)
  [UrgeStatus.PRESENT]: 0.7,   // Still present is a challenging outcome (high intensity)
  [UrgeStatus.OVERCOME]: 1.0,  // Overcome is a negative outcome (very high intensity)
};

/**
 * Interface for processed emotion data
 */
export interface EmotionData {
  date: string;
  intensity: number;
  color: string;
}

/**
 * Process daily data to calculate emotion intensity and color
 * 
 * @param dailyData Array of daily status counts
 * @returns Array of processed emotion data with date, intensity, and color
 */
export const processEmotionData = (dailyData: DailyStatusCounts[]): EmotionData[] => {
  debugEmotion("Processing daily data for emotion map: %d days", dailyData.length);
  
  return dailyData.map(day => {
    // Calculate weighted average of intensities
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Log the counts for this day
    debugEmotion("Day %s counts: %o", day.date, day.counts);
    
    // Extract emotion counts for color calculation
    const emotionCounts: EmotionCounts = {
      peaceful: day.counts[UrgeStatus.PEACEFUL] || 0,
      urge: (day.counts[UrgeStatus.PENDING] || 0) + (day.counts[UrgeStatus.PRESENT] || 0),
      tookOver: day.counts[UrgeStatus.OVERCOME] || 0
    };
    
    // Generate color from the emotion counts
    const color = getEmotionColor(emotionCounts);
    
    // Calculate intensity (legacy method, kept for backward compatibility)
    Object.entries(STATUS_WEIGHTS).forEach(([status, weight]) => {
      if (day.counts[status] > 0) {
        const statusWeight = day.counts[status] * weight;
        weightedSum += statusWeight;
        totalWeight += day.counts[status];
        debugEmotion("Status %s: count=%d, weight=%f, contribution=%f", 
          status, day.counts[status], weight, statusWeight);
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
      
      debugEmotion("Final intensity for %s: %f (base: %f, count factor: %f)", 
        day.date, intensity, weightedSum / totalWeight, countFactor);
    }
    
    // Log the calculated color
    debugEmotion("Color for %s: %s (peaceful: %d, urge: %d, tookOver: %d)",
      day.date, color, emotionCounts.peaceful, emotionCounts.urge, emotionCounts.tookOver);
    
    return {
      date: day.date,
      intensity,
      color,
    };
  });
}; 