import prisma from '../config/database';
import { z } from 'zod';
import { User, UserRegistrationData } from '@repo/shared-types';
import { PrismaClient } from '@prisma/client';

// Validation schema for user registration
export const userRegistrationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
});

// Get a properly typed Prisma client
const db = prisma as PrismaClient;

// Helper function to convert Prisma dates to timestamp numbers
const convertDatesToTimestamps = (obj: any): any => {
  const result = { ...obj };
  if (result.createTime instanceof Date) {
    result.createTime = result.createTime.getTime();
  }
  if (result.updateTime instanceof Date) {
    result.updateTime = result.updateTime.getTime();
  }
  return result;
};

export const UserModel = {
  /**
   * Register a device or get existing user
   */
  async registerDevice(data: UserRegistrationData): Promise<{ success: true; user: User }> {
    const { deviceId } = data;
    
    try {
      // Find existing user by deviceId or create new one
      const user = await db.user.upsert({
        where: {
          deviceId: deviceId,
        },
        create: {
          deviceId: deviceId,
        },
        update: {
          // Only updating the updateTime timestamp
        },
      });
      
      // Convert Date objects to timestamp numbers
      const userWithTimestamps = convertDatesToTimestamps(user);
      
      return { success: true, user: userWithTimestamps as User };
    } catch (error) {
      console.error('Error in user model:', error);
      throw error;
    }
  },

  /**
   * Get user by device ID
   */
  async getUserByDeviceId(deviceId: string): Promise<User | null> {
    try {
      const user = await db.user.findUnique({
        where: { deviceId },
      });
      
      if (!user) return null;
      
      // Convert Date objects to timestamp numbers
      const userWithTimestamps = convertDatesToTimestamps(user);
      
      return userWithTimestamps as User;
    } catch (error) {
      console.error('Error in user model:', error);
      throw error;
    }
  }
}; 