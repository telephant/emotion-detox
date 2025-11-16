/**
 * Storage Index
 * Centralized exports for all storage modules
 */

export * from './auth';
export * from './device';

// Re-export commonly used storage for convenience
export { authStorage } from './auth';
export { deviceStorage } from './device';
