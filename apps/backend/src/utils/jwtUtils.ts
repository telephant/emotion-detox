import jwt, { SignOptions } from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email?: string;
  isAnonymous: boolean;
}

/**
 * JWT Utilities for authentication
 */
export class JwtUtils {
  
  /**
   * Generate a JWT token for a user
   */
  static generateToken(payload: JwtPayload): string {
    try {
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'emotion-detox-api',
        audience: 'emotion-detox-mobile',
      });

      console.log('🔐 JWT token generated for user:', payload.userId);
      return token;
    } catch (error) {
      console.error('❌ Error generating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'emotion-detox-api',
        audience: 'emotion-detox-mobile',
      }) as JwtPayload;

      console.log('✅ JWT token verified for user:', decoded.userId);
      return decoded;
    } catch (error) {
      console.error('❌ JWT token verification failed:', error);

      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Authentication token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid authentication token');
      } else {
        throw new Error('Authentication failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate a token for an anonymous user
   */
  static generateAnonymousToken(userId: string): string {
    return this.generateToken({
      userId,
      isAnonymous: true,
    });
  }

  /**
   * Generate a token for an authenticated user
   */
  static generateAuthenticatedToken(userId: string, email: string): string {
    return this.generateToken({
      userId,
      email,
      isAnonymous: false,
    });
  }

  /**
   * Check if a token represents an anonymous user
   */
  static isAnonymousToken(payload: JwtPayload): boolean {
    return payload.isAnonymous === true;
  }

  /**
   * Refresh a token (generate new token with same payload but extended expiry)
   */
  static refreshToken(oldToken: string): string {
    try {
      // Verify the old token first (this will throw if invalid/expired)
      const payload = this.verifyToken(oldToken);
      
      // Generate a new token with the same payload
      return this.generateToken(payload);
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      throw error; // Re-throw the verification error
    }
  }
}
