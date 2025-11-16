import prisma from '../config/database';
import { z } from 'zod';
import { User, UserRegistrationData } from '@repo/shared-types';
import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from '../utils/passwordUtils';
import { JwtUtils } from '../utils/jwtUtils';

// Validation schema for user registration (device-based)
export const userRegistrationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
});

// Validation schema for email/password registration
export const emailRegistrationSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  anonymousUserId: z.string().optional(), // For migrating anonymous user data
});

// Validation schema for login
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Extended User type for authentication responses
export interface AuthenticatedUser extends User {
  email?: string;
  isAnonymous: boolean;
}

export interface AuthResponse {
  success: true;
  user: AuthenticatedUser;
  token: string;
}

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
   * Register a device or get existing user (for anonymous users)
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
          isAnonymous: true, // Mark as anonymous user
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
  },

  /**
   * Register a new user with email and password
   */
  async registerWithEmail(data: { email: string; password: string; anonymousUserId?: string }): Promise<AuthResponse> {
    const { email, password, anonymousUserId } = data;

    try {
      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash the password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      let user;

      if (anonymousUserId) {
        // Migrate anonymous user to registered user
        console.log('🔄 Migrating anonymous user to registered user:', anonymousUserId);

        const anonymousUser = await db.user.findUnique({
          where: { id: anonymousUserId },
        });

        if (!anonymousUser) {
          throw new Error('Anonymous user not found');
        }

        if (!anonymousUser.isAnonymous) {
          throw new Error('User is already registered');
        }

        // Update the anonymous user with email and password
        user = await db.user.update({
          where: { id: anonymousUserId },
          data: {
            email,
            password: hashedPassword,
            isAnonymous: false,
          },
        });

        console.log('✅ Anonymous user migrated successfully');
      } else {
        // Create a new registered user
        user = await db.user.create({
          data: {
            deviceId: `user-${Date.now()}`, // Generate a unique device ID for web users
            email,
            password: hashedPassword,
            isAnonymous: false,
          },
        });

        console.log('✅ New registered user created');
      }

      // Generate JWT token
      const token = JwtUtils.generateAuthenticatedToken(user.id, email);

      // Convert Date objects to timestamp numbers
      const userWithTimestamps = convertDatesToTimestamps(user);

      return {
        success: true,
        user: userWithTimestamps as AuthenticatedUser,
        token,
      };
    } catch (error) {
      console.error('Error registering user with email:', error);
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  async loginWithEmail(data: { email: string; password: string }): Promise<AuthResponse> {
    const { email, password } = data;

    try {
      // Find user by email
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.password) {
        throw new Error('User has no password set');
      }

      // Verify password
      const isValidPassword = await PasswordUtils.verifyPassword(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = JwtUtils.generateAuthenticatedToken(user.id, email);

      // Convert Date objects to timestamp numbers
      const userWithTimestamps = convertDatesToTimestamps(user);

      console.log('✅ User logged in successfully:', user.id);

      return {
        success: true,
        user: userWithTimestamps as AuthenticatedUser,
        token,
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) return null;

      // Convert Date objects to timestamp numbers
      const userWithTimestamps = convertDatesToTimestamps(user);

      return userWithTimestamps as AuthenticatedUser;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },
};