/**
 * Device Utilities
 * Pure utility functions for device-related operations
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate an anonymous ID in the format "anon-xxxxxx"
 */
export function generateAnonymousId(): string {
  const shortUuid = uuidv4().replace(/-/g, '').substring(0, 6);
  return `anon-${shortUuid}`;
}

/**
 * Check if an ID is an anonymous ID
 */
export function isAnonymousId(id: string): boolean {
  return id.startsWith('anon-');
}

/**
 * Validate anonymous ID format
 */
export function isValidAnonymousId(id: string): boolean {
  return /^anon-[a-f0-9]{6}$/.test(id);
}
