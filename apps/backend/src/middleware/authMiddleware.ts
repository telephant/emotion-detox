import { Request, Response, NextFunction } from 'express';
import { JwtUtils, JwtPayload } from '../utils/jwtUtils';
import { sendError } from '../utils/responseFormatter';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      isAuthenticated?: boolean;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 * This middleware is REQUIRED - requests without valid tokens will be rejected
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('❌ No authentication token provided');
      sendError(res, 'Authentication token required', 401);
      return;
    }

    // Verify the token
    const payload = JwtUtils.verifyToken(token);
    
    // Add user info to request
    req.user = payload;
    req.isAuthenticated = true;
    
    console.log('✅ User authenticated:', payload.userId, payload.isAnonymous ? '(anonymous)' : '(registered)');
    next();
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    
    if (error instanceof Error) {
      sendError(res, error.message, 401);
    } else {
      sendError(res, 'Authentication failed', 401);
    }
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is present and valid, but doesn't reject if missing
 * This is useful for endpoints that work for both anonymous and authenticated users
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('ℹ️ No authentication token provided (optional auth)');
      req.isAuthenticated = false;
      next();
      return;
    }

    // Try to verify the token
    try {
      const payload = JwtUtils.verifyToken(token);
      
      // Add user info to request
      req.user = payload;
      req.isAuthenticated = true;
      
      console.log('✅ User authenticated (optional):', payload.userId, payload.isAnonymous ? '(anonymous)' : '(registered)');
    } catch (tokenError) {
      console.log('⚠️ Invalid token provided (optional auth), continuing without auth');
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in optional auth middleware:', error);
    // For optional auth, we continue even if there's an error
    req.isAuthenticated = false;
    next();
  }
};

/**
 * Middleware that requires the user to be a registered (non-anonymous) user
 */
export const requireRegisteredUser = (req: Request, res: Response, next: NextFunction): void => {
  // First check if user is authenticated
  if (!req.isAuthenticated || !req.user) {
    console.log('❌ User not authenticated for registered-only endpoint');
    sendError(res, 'Authentication required', 401);
    return;
  }

  // Check if user is anonymous
  if (req.user.isAnonymous) {
    console.log('❌ Anonymous user attempted to access registered-only endpoint');
    sendError(res, 'This feature requires account registration', 403);
    return;
  }

  console.log('✅ Registered user verified:', req.user.userId);
  next();
};

/**
 * Middleware that allows only anonymous users (useful for registration/login endpoints)
 */
export const requireAnonymousUser = (req: Request, res: Response, next: NextFunction): void => {
  // If no authentication, that's fine for anonymous endpoints
  if (!req.isAuthenticated || !req.user) {
    console.log('ℹ️ Unauthenticated user accessing anonymous endpoint');
    next();
    return;
  }

  // If user is authenticated but anonymous, that's also fine
  if (req.user.isAnonymous) {
    console.log('ℹ️ Anonymous user accessing anonymous endpoint');
    next();
    return;
  }

  // If user is registered, they shouldn't access anonymous-only endpoints
  console.log('❌ Registered user attempted to access anonymous-only endpoint');
  sendError(res, 'This endpoint is for anonymous users only', 403);
};

/**
 * Helper function to get user ID from request (works for both anonymous and registered users)
 */
export const getUserIdFromRequest = (req: Request): string | null => {
  return req.user?.userId || null;
};

/**
 * Helper function to check if request is from anonymous user
 */
export const isAnonymousRequest = (req: Request): boolean => {
  return req.user?.isAnonymous === true;
};
