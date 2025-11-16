import bcrypt from 'bcryptjs';

/**
 * Password utilities for hashing and verification
 */
export class PasswordUtils {
  
  // Salt rounds for bcrypt (higher = more secure but slower)
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain text password
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    try {
      console.log('🔒 Hashing password...');
      const hashedPassword = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
      console.log('✅ Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      console.error('❌ Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a plain text password against a hashed password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      console.log('🔍 Verifying password...');
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      console.log('✅ Password verification completed:', isValid ? 'valid' : 'invalid');
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length (to prevent DoS attacks)
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // At least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a random password (useful for testing or temporary passwords)
   */
  static generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
