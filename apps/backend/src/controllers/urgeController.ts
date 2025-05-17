import { Request, Response } from 'express';
import { UrgeModel, urgeSchema, urgeStatusUpdateSchema } from '../models/urgeModel';
import { sendError, sendSuccess } from '../utils/responseFormatter';
import { z } from 'zod';
import { UrgeData, UrgeStatusUpdateData } from '@repo/shared-types';

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
        return sendError(res, error.errors);
      }
      
      return sendError(res, 'Invalid request');
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
        return sendError(res, error.errors);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message);
      }
      
      return sendError(res, 'Invalid request');
    }
  },

  /**
   * Get all urge records
   */
  async getUrges(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const urges = await UrgeModel.getUrges(userId);
      
      return sendSuccess(res, { urges });
    } catch (error) {
      console.error('Error fetching urges:', error);
      return sendError(res, 'Server error', 500);
    }
  },
  
  /**
   * Get urge statistics (count and recent records)
   */
  async getUrgeStats(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const stats = await UrgeModel.getUrgeStats(userId);
      
      return sendSuccess(res, stats);
    } catch (error) {
      console.error('Error fetching urge statistics:', error);
      return sendError(res, 'Server error', 500);
    }
  }
}; 