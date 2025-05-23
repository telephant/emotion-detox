/**
 * Shared model types used across frontend and backend
 */

/**
 * Urge status enum representing different outcomes after delaying an urge
 */
export enum UrgeStatus {
  PENDING = 'PENDING',   // Initial state when urge is first created
  PEACEFUL = 'PEACEFUL', // Outcome 1: User feels peaceful after the delay
  PRESENT = 'PRESENT',   // Outcome 2: Urge is still present after the delay
  OVERCOME = 'OVERCOME'  // Outcome 3: Urge took over the user
}

/**
 * User model representation
 */
export interface User {
  id: string;
  deviceId: string;
  createTime: string | Date; // Timestamp
  updateTime: string | Date; // Timestamp
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  deviceId: string;
}

/**
 * Urge model representation
 */
export interface Urge {
  id: number;
  type: string;
  count: number;
  status: UrgeStatus;
  userId?: string | null;
  createTime: string | Date; // Timestamp
  updateTime: string | Date; // Timestamp
}

/**
 * Data required to create or update an urge
 */
export interface UrgeData {
  type: string;
  userId: string;
  status?: UrgeStatus; // Optional since PENDING is the default
}

/**
 * Data required to update an urge status
 */
export interface UrgeStatusUpdateData {
  id: number;
  status: UrgeStatus;
  userId?: string;
}

/**
 * Daily status counts for emotion map visualization
 */
export interface DailyStatusCounts {
  date: string; // ISO date string (YYYY-MM-DD)
  counts: {
    [key: string]: number;
    total: number;
  };
}

/**
 * Emotion map data for visualization
 */
export interface EmotionMapData {
  dailyData: DailyStatusCounts[];
  totalDays: number;
}

/**
 * Mood model representation
 */
export interface Mood {
  id: string;
  text: string;
  emoji: string | null;
  userId: string;
  date: string | Date;
  updateTime?: string | Date;
} 