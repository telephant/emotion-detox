import {
  Urge,
  UrgeData,
  UrgeStatus,
  UrgeStatusUpdateData,
} from '@repo/shared-types';
import { z } from 'zod';
import prisma from '../config/database';

// Validation schema for urge data
export const urgeSchema = z.object({
  type: z.string(),
  userId: z.string().optional(),
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
  async delayUrge(data: UrgeData): Promise<{ success: true; urge: Urge }> {
    const { type, userId, status = UrgeStatus.PENDING } = data;
    
    try {
      // Create a new urge record for each action
      const urge = await prisma.urge.create({
        data: {
          type,
          userId,
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
  async updateUrgeStatus(data: UrgeStatusUpdateData): Promise<{ success: true; urge: Urge }> {
    const { id, status, userId } = data;

    try {
      // Find the urge and verify ownership if userId is provided
      const existingUrge = await prisma.urge.findFirst({
        where: {
          id,
          ...(userId ? { userId } : {})
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
      const urges = await prisma.urge.findMany({
        where: userId ? { userId } : {},
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
      // Count total urges
      const total = await prisma.urge.count({
        where: userId ? { userId } : {}
      });
      
      // Get most recent urges
      const recent = await prisma.urge.findMany({
        where: userId ? { userId } : {},
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
  }
}; 