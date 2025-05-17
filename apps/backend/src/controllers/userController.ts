import { Request, Response } from 'express';
import { UserModel, userRegistrationSchema } from '../models/userModel';
import { sendError, sendSuccess } from '../utils/responseFormatter';
import { z } from 'zod';

export const UserController = {
  /**
   * Register a device or retrieve existing user
   */
  async registerDevice(req: Request, res: Response) {
    try {
      // Validate request body
      const userData = userRegistrationSchema.parse(req.body);
      
      // Register the device
      const result = await UserModel.registerDevice(userData);
      
      return sendSuccess(res, result.user);
    } catch (error) {
      console.error('Error registering device:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors);
      }
      
      return sendError(res, 'Invalid request');
    }
  },

  /**
   * Get a user by device ID
   */
  async getUserByDeviceId(req: Request, res: Response) {
    try {
      const deviceId = req.query.deviceId as string;
      
      if (!deviceId) {
        return sendError(res, 'Device ID is required');
      }
      
      const user = await UserModel.getUserByDeviceId(deviceId);
      
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      
      return sendSuccess(res, user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return sendError(res, 'Server error', 500);
    }
  }
}; 