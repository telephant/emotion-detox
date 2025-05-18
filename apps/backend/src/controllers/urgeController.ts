import { UrgeData, UrgeStatusUpdateData } from '@repo/shared-types';
import { Request, Response } from 'express';
import { z } from 'zod';
import { UrgeModel, urgeSchema, urgeStatusUpdateSchema } from '../models/urgeModel';
import { sendError, sendSuccess } from '../utils/responseFormatter';

// Request validation schemas
const userIdParam = z.object({
  userId: z.string({ required_error: "userId is required" })
});

const weeksParam = z.object({
  weeks: z.string().optional().transform(val => val ? parseInt(val, 10) : 7)
});

export const UrgeController = {
  /**
   * Record a new urge delay action
   * Each call creates a new record in the database
   */
  async delayUrge(req: Request, res: Response) {
    try {
      // Validate request body
      const urgeData = urgeSchema.parse(req.body) as UrgeData;
      
      // Process the urge delay - creates a new record
      const result = await UrgeModel.delayUrge(urgeData);
      
      return sendSuccess(res, result.urge);
    } catch (error) {
      console.error('Error processing urge action:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      return sendError(res, 'Invalid request', 400);
    }
  },

  /**
   * Update the status of an existing urge
   */
  async updateUrgeStatus(req: Request, res: Response) {
    try {
      // Validate request body
      const updateData = urgeStatusUpdateSchema.parse(req.body) as UrgeStatusUpdateData;
      
      // Update the urge status
      const result = await UrgeModel.updateUrgeStatus(updateData);
      
      return sendSuccess(res, result.urge);
    } catch (error) {
      console.error('Error updating urge status:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message, 400);
      }
      
      return sendError(res, 'Invalid request', 400);
    }
  },

  /**
   * Get all urge records
   */
  async getUrges(req: Request, res: Response) {
    try {
      // Validate userId param is present
      const { userId } = userIdParam.parse(req.query);
      
      const urges = await UrgeModel.getUrges(userId);
      
      return sendSuccess(res, { urges });
    } catch (error) {
      console.error('Error fetching urges:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      return sendError(res, 'Server error', 500);
    }
  },
  
  /**
   * Get urge statistics (count and recent records)
   */
  async getUrgeStats(req: Request, res: Response) {
    try {
      // Validate userId param is present
      const { userId } = userIdParam.parse(req.query);
      
      const stats = await UrgeModel.getUrgeStats(userId);
      
      return sendSuccess(res, stats);
    } catch (error) {
      console.error('Error fetching urge statistics:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      return sendError(res, 'Server error', 500);
    }
  },

  /**
   * Get emotion map data with status counts by date
   */
  async getEmotionMapData(req: Request, res: Response) {
    try {
      // Validate required userId and optional weeks params
      const { userId } = userIdParam.parse(req.query);
      const { weeks } = weeksParam.parse(req.query);
      
      const emotionData = await UrgeModel.getEmotionMapData(userId, weeks);
      
      return sendSuccess(res, emotionData);
    } catch (error) {
      console.error('Error fetching emotion map data:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      return sendError(res, 'Server error', 500);
    }
  }
}; 