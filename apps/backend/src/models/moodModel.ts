import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Create a new PrismaClient instance
const prisma = new PrismaClient();

// Validation schema for mood creation
export const moodSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  text: z.string({ required_error: "Mood text is required" })
    .min(1, "Mood text cannot be empty"),
  emoji: z.string().optional(),
});

// Validation schema for mood updates
export const moodUpdateSchema = z.object({
  text: z.string({ required_error: "Mood text is required" })
    .min(1, "Mood text cannot be empty"),
  emoji: z.string().optional(),
});

// Types
export type MoodData = z.infer<typeof moodSchema>;
export type MoodUpdateData = z.infer<typeof moodUpdateSchema>;

export const MoodModel = {
  /**
   * Create a new mood entry
   */
  async createMood(data: MoodData) {
    const { userId, text, emoji } = data;
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create the mood
    const mood = await prisma.mood.create({
      data: {
        text,
        emoji: emoji || null,
        userId,
        date: new Date()
      }
    });
    
    return { mood };
  },
  
  /**
   * Get all moods for a user
   */
  async getUserMoods(userId: string) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all moods for this user
    const moods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    
    return { moods };
  },
  
  /**
   * Get a mood by ID
   */
  async getMoodById(moodId: string) {
    const mood = await prisma.mood.findUnique({
      where: { id: moodId }
    });
    
    if (!mood) {
      throw new Error('Mood not found');
    }
    
    return { mood };
  },
  
  /**
   * Update a mood
   */
  async updateMood(moodId: string, data: MoodUpdateData) {
    const { text, emoji } = data;
    
    // Verify mood exists
    const existingMood = await prisma.mood.findUnique({
      where: { id: moodId }
    });
    
    if (!existingMood) {
      throw new Error('Mood not found');
    }
    
    // Update the mood
    const mood = await prisma.mood.update({
      where: { id: moodId },
      data: {
        text,
        emoji: emoji || null,
        updateTime: new Date()
      }
    });
    
    return { mood };
  },
  
  /**
   * Delete a mood
   */
  async deleteMood(moodId: string) {
    // Verify mood exists
    const mood = await prisma.mood.findUnique({
      where: { id: moodId }
    });
    
    if (!mood) {
      throw new Error('Mood not found');
    }
    
    // Delete the mood
    await prisma.mood.delete({
      where: { id: moodId }
    });
    
    return { success: true, message: 'Mood deleted successfully' };
  }
}; 