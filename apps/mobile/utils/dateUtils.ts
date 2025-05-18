/**
 * Date utility functions for the mobile app
 */

/**
 * Format a date to YYYY-MM-DD string using local timezone
 * @param date The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 