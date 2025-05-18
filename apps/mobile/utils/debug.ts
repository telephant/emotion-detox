/**
 * Debug utility for consistent logging throughout the app
 * Can be easily disabled for production or redirected to a monitoring service
 */

import debug from 'debug';

/**
 * Debug namespaces for the application
 */
export const debugNamespaces = {
  EMOTION: debug('app:emotion'),
  MAP: debug('app:map'),
  GRID: debug('app:grid'),
  API: debug('app:api'),
  GENERAL: debug('app:general')
};

// Enable all debug output when in development
if (__DEV__) {
  debug.enable('app:*');
}

/**
 * Log a debug message to the emotion namespace
 */
export const debugEmotion = debugNamespaces.EMOTION;

/**
 * Log a debug message to the map namespace
 */
export const debugMap = debugNamespaces.MAP;

/**
 * Log a debug message to the grid namespace
 */
export const debugGrid = debugNamespaces.GRID;

/**
 * Log a debug message to the API namespace
 */
export const debugApi = debugNamespaces.API;

/**
 * Log a debug message to the general namespace
 */
export const debugGeneral = debugNamespaces.GENERAL;

/**
 * Log an error with appropriate formatting
 * 
 * @param category The log category
 * @param message The error message
 * @param error The error object or additional details
 */
export const debugError = (
  category: string,
  message: string,
  error?: any
) => {
  if (__DEV__) {
    console.error(`[${category.toUpperCase()}] 🔴 ERROR: ${message}`, error || '');
  }
};

/**
 * Log a warning with appropriate formatting
 * 
 * @param category The log category
 * @param message The warning message
 * @param optionalParams Additional parameters to log
 */
export const debugWarn = (
  category: string,
  message: string,
  ...optionalParams: any[]
) => {
  if (__DEV__) {
    console.warn(`[${category.toUpperCase()}] ⚠️ ${message}`, ...optionalParams);
  }
}; 