import { Request, Response } from 'express';
import { z } from 'zod';
import { MoodModel, moodSchema, moodUpdateSchema } from '../models/moodModel';
import { sendError, sendSuccess } from '../utils/responseFormatter';

// Parameter validation schemas
const paramsWithUserId = z.object({
  userId: z.string({ required_error: "User ID is required" })
});

const paramsWithMoodId = z.object({
  moodId: z.string({ required_error: "Mood ID is required" })
});

/**
 * Create a new mood entry
 */
export const createMood = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const moodData = moodSchema.parse(req.body);
    
    // Create the mood
    const result = await MoodModel.createMood(moodData);
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('Error creating mood:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors, 400);
    }
    
    if (error instanceof Error) {
      return sendError(res, error.message, 400);
    }
    
    return sendError(res, 'Failed to create mood entry', 500);
  }
};

/**
 * Get all moods for a user
 */
export const getUserMoods = async (req: Request, res: Response) => {
  try {
    // Validate userId parameter
    const { userId } = paramsWithUserId.parse(req.params);
    
    // Get user moods
    const result = await MoodModel.getUserMoods(userId);
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('Error fetching moods:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors, 400);
    }
    
    if (error instanceof Error) {
      return sendError(res, error.message, 400);
    }
    
    return sendError(res, 'Failed to fetch mood entries', 500);
  }
};

/**
 * Get a mood by ID
 */
export const getMoodById = async (req: Request, res: Response) => {
  try {
    // Validate moodId parameter
    const { moodId } = paramsWithMoodId.parse(req.params);
    
    // Get the mood
    const result = await MoodModel.getMoodById(moodId);
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('Error fetching mood:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors, 400);
    }
    
    if (error instanceof Error) {
      return sendError(res, error.message, 404);
    }
    
    return sendError(res, 'Failed to fetch mood entry', 500);
  }
};

/**
 * Update a mood
 */
export const updateMood = async (req: Request, res: Response) => {
  try {
    // Validate moodId parameter
    const { moodId } = paramsWithMoodId.parse(req.params);
    
    // Validate request body
    const updateData = moodUpdateSchema.parse(req.body);
    
    // Update the mood
    const result = await MoodModel.updateMood(moodId, updateData);
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('Error updating mood:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors, 400);
    }
    
    if (error instanceof Error) {
      return sendError(res, error.message, 400);
    }
    
    return sendError(res, 'Failed to update mood entry', 500);
  }
};

/**
 * Delete a mood
 */
export const deleteMood = async (req: Request, res: Response) => {
  try {
    // Validate moodId parameter
    const { moodId } = paramsWithMoodId.parse(req.params);
    
    // Delete the mood
    const result = await MoodModel.deleteMood(moodId);
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('Error deleting mood:', error);
    
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors, 400);
    }
    
    if (error instanceof Error) {
      return sendError(res, error.message, 404);
    }
    
    return sendError(res, 'Failed to delete mood entry', 500);
  }
}; 