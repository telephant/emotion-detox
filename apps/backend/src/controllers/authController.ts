import { Request, Response } from 'express';
import { UserModel, emailRegistrationSchema, loginSchema } from '../models/userModel';
import { sendError, sendSuccess } from '../utils/responseFormatter';
import { z } from 'zod';

export const AuthController = {
  /**
   * Register a new user with email and password
   */
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const userData = emailRegistrationSchema.parse(req.body);
      
      // Register the user
      const result = await UserModel.registerWithEmail(userData);
      
      return sendSuccess(res, {
        user: result.user,
        token: result.token,
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error('Error registering user:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message, 400);
      }
      
      return sendError(res, 'Registration failed', 500);
    }
  },

  /**
   * Login with email and password
   */
  async login(req: Request, res: Response) {
    try {
      // Validate request body
      const loginData = loginSchema.parse(req.body);
      
      // Authenticate the user
      const result = await UserModel.loginWithEmail(loginData);
      
      return sendSuccess(res, {
        user: result.user,
        token: result.token,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message, 401);
      }
      
      return sendError(res, 'Login failed', 500);
    }
  },

  /**
   * Get current user profile (requires authentication)
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Get fresh user data from database
      const user = await UserModel.getUserById(req.user.userId);
      
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, {
        user,
        message: 'Profile retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      return sendError(res, 'Failed to get profile', 500);
    }
  },

  /**
   * Migrate anonymous user data to registered account
   * This endpoint allows an anonymous user to register and keep their data
   */
  async migrateAnonymousUser(req: Request, res: Response) {
    try {
      // Validate request body
      const userData = emailRegistrationSchema.parse(req.body);
      
      if (!userData.anonymousUserId) {
        return sendError(res, 'Anonymous user ID is required for migration', 400);
      }
      
      // Register the user and migrate data
      const result = await UserModel.registerWithEmail(userData);
      
      return sendSuccess(res, {
        user: result.user,
        token: result.token,
        message: 'Anonymous user migrated successfully',
      });
    } catch (error) {
      console.error('Error migrating anonymous user:', error);
      
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors, 400);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message, 400);
      }
      
      return sendError(res, 'Migration failed', 500);
    }
  },

  /**
   * Logout (client-side token invalidation)
   * Since we're using stateless JWT, logout is mainly handled client-side
   */
  async logout(req: Request, res: Response) {
    try {
      // In a stateless JWT system, logout is primarily handled client-side
      // by removing the token from storage
      
      return sendSuccess(res, {
        message: 'Logout successful. Please remove the token from client storage.',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      return sendError(res, 'Logout failed', 500);
    }
  },

  /**
   * Refresh JWT token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Get fresh user data to ensure user still exists and is valid
      const user = await UserModel.getUserById(req.user.userId);
      
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Generate new token
      const { JwtUtils } = await import('../utils/jwtUtils');
      const newToken = user.isAnonymous 
        ? JwtUtils.generateAnonymousToken(user.id)
        : JwtUtils.generateAuthenticatedToken(user.id, user.email!);

      return sendSuccess(res, {
        token: newToken,
        user,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      return sendError(res, 'Token refresh failed', 500);
    }
  },

  /**
   * Check authentication status
   */
  async checkAuth(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated || !req.user) {
        return sendSuccess(res, {
          isAuthenticated: false,
          isAnonymous: true,
          message: 'User not authenticated',
        });
      }

      return sendSuccess(res, {
        isAuthenticated: true,
        isAnonymous: req.user.isAnonymous,
        user: req.user,
        message: 'User is authenticated',
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      return sendError(res, 'Auth check failed', 500);
    }
  },
};
