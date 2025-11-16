import {
  Urge,
  UrgeData,
  UrgeStatus,
  UrgeStatusUpdateData,
  EmotionMapData,
  DailyStatusCounts,
} from '@repo/shared-types';
import { z } from 'zod';
import prisma from '../config/database';
import { Urge as PrismaUrge } from '@prisma/client';

// Validation schema for urge data
export const urgeSchema = z.object({
  type: z.string(),
  userId: z.string(), // Required to match UrgeData interface
  status: z.enum([
    UrgeStatus.PENDING,
    UrgeStatus.PEACEFUL,
    UrgeStatus.PRESENT,
    UrgeStatus.OVERCOME
  ]).optional().default(UrgeStatus.PENDING)
});

// Validation schema for urge status update
export const urgeStatusUpdateSchema = z.object({
  id: z.number(),
  userId: z.string().optional(),
  status: z.enum([
    UrgeStatus.PENDING, 
    UrgeStatus.PEACEFUL, 
    UrgeStatus.PRESENT, 
    UrgeStatus.OVERCOME
  ])
});

// Now we can reuse the shared type rather than define it locally
// export type UrgeData = z.infer<typeof urgeSchema>;

export const UrgeModel = {
  /**
   * Record a new urge delay action
   * Each call creates a new record in the database
   */
  async delayUrge(data: UrgeData & { deviceId?: string }): Promise<{ success: true; urge: Urge }> {
    const { type, userId, deviceId, status = UrgeStatus.PENDING } = data;

    try {
      // Use deviceId if provided, otherwise fall back to userId
      const userDeviceId = deviceId || userId;

      // Ensure user exists - find by deviceId or create new
      const user = await prisma.user.upsert({
        where: { deviceId: userDeviceId },
        create: {
          id: userDeviceId,
          deviceId: userDeviceId,
          isAnonymous: userDeviceId.startsWith('anon-'), // Auto-detect based on ID pattern
        },
        update: {
          // User already exists, no need to update anything
        },
      });

      // Use the actual user ID from database
      const actualUserId = user.id;

      // Create a new urge record for each action
      const urge = await prisma.urge.create({
        data: {
          type,
          userId: actualUserId, // Use the actual user ID from database
          status,
          count: 1, // Each record represents a single action
        },
      });

      return { success: true, urge: urge as Urge };
    } catch (error) {
      console.error('Error in urge model:', error);
      throw error;
    }
  },

  /**
   * Update the status of an existing urge
   */
  async updateUrgeStatus(data: UrgeStatusUpdateData & { deviceId?: string }): Promise<{ success: true; urge: Urge }> {
    const { id, status, userId, deviceId } = data;

    try {
      let actualUserId = userId;

      // Use deviceId if provided, otherwise fall back to userId
      const userDeviceId = deviceId || userId;

      if (userDeviceId) {
        // Resolve deviceId to actual userId
        const user = await prisma.user.findUnique({
          where: { deviceId: userDeviceId }
        });

        if (user) {
          actualUserId = user.id;
        } else {
          // Create user if they don't exist
          const newUser = await prisma.user.create({
            data: {
              id: userDeviceId,
              deviceId: userDeviceId,
              isAnonymous: userDeviceId.startsWith('anon-'),
            }
          });
          actualUserId = newUser.id;
        }
      }

      // Find the urge and verify ownership if userId is provided
      const existingUrge = await prisma.urge.findFirst({
        where: {
          id,
          ...(actualUserId ? { userId: actualUserId } : {})
        }
      });

      if (!existingUrge) {
        throw new Error('Urge not found or does not belong to the user');
      }

      // Update the urge status
      const urge = await prisma.urge.update({
        where: { id },
        data: { status }
      });

      return { success: true, urge: urge as Urge };
    } catch (error) {
      console.error('Error updating urge status:', error);
      throw error;
    }
  },

  /**
   * Get all urge records
   */
  async getUrges(userId?: string): Promise<Urge[]> {
    try {
      let actualUserId = userId;

      if (userId) {
        // Resolve deviceId to actual userId
        const user = await prisma.user.findUnique({
          where: { deviceId: userId }
        });

        if (user) {
          actualUserId = user.id;
        }
      }

      const urges = await prisma.urge.findMany({
        where: actualUserId ? { userId: actualUserId } : {},
        orderBy: {
          createTime: 'desc' // Most recent first
        }
      });

      return urges as Urge[];
    } catch (error) {
      console.error('Error in urge model:', error);
      throw error;
    }
  },
  
  /**
   * Get urge statistics (count and latest records)
   */
  async getUrgeStats(userId?: string): Promise<{ total: number; recent: Urge[] }> {
    try {
      let actualUserId = userId;

      if (userId) {
        // Resolve deviceId to actual userId
        const user = await prisma.user.findUnique({
          where: { deviceId: userId }
        });

        if (user) {
          actualUserId = user.id;
        }
      }

      // Count total urges
      const total = await prisma.urge.count({
        where: actualUserId ? { userId: actualUserId } : {}
      });

      // Get most recent urges
      const recent = await prisma.urge.findMany({
        where: actualUserId ? { userId: actualUserId } : {},
        orderBy: {
          createTime: 'desc'
        },
        take: 10 // Limit to most recent 10
      });

      return { total, recent: recent as Urge[] };
    } catch (error) {
      console.error('Error getting urge stats:', error);
      throw error;
    }
  },

  /**
   * Get emotion map data with status counts by date
   */
  async getEmotionMapData(userId: string, weeks: number = 7): Promise<EmotionMapData> {
    try {
      // Resolve deviceId to actual userId
      const user = await prisma.user.findUnique({
        where: { deviceId: userId }
      });

      const actualUserId = user ? user.id : userId;

      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7)); // Go back X weeks

      // Get all urges in the date range for the specified user
      const urges = await prisma.urge.findMany({
        where: {
          userId: actualUserId, // Use resolved userId
          createTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createTime: 'asc',
        },
      });
      
      // Group urges by date and status
      const dateMap = new Map<string, {
        [UrgeStatus.PEACEFUL]: number;
        [UrgeStatus.PRESENT]: number;
        [UrgeStatus.OVERCOME]: number;
        [UrgeStatus.PENDING]: number;
        total: number;
        [key: string]: number;
      }>();
      
      urges.forEach((urge: PrismaUrge) => {
        const date = new Date(urge.createTime);
        const dateString = date.toISOString().split('T')[0];
        
        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, {
            [UrgeStatus.PEACEFUL]: 0,
            [UrgeStatus.PRESENT]: 0,
            [UrgeStatus.OVERCOME]: 0,
            [UrgeStatus.PENDING]: 0,
            total: 0,
          });
        }
        
        const statusCounts = dateMap.get(dateString);
        if (!statusCounts) return;
        
        const status = urge.status as UrgeStatus;
        if (status && Object.values(UrgeStatus).includes(status)) {
          statusCounts[status] += 1;
        } else {
          statusCounts[UrgeStatus.PENDING] += 1;
        }
        
        statusCounts.total += 1;
      });
      
      // Convert map to array of daily data
      const dailyData: DailyStatusCounts[] = Array.from(dateMap.entries()).map(([date, counts]) => ({
        date,
        counts: {
          ...counts
        },
      }));
      
      return {
        dailyData,
        totalDays: dailyData.length,
      };
    } catch (error) {
      console.error('Error getting emotion map data:', error);
      throw error;
    }
  }
};
