import { Response } from 'express';

/**
 * Success response formatter
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Error response formatter
 */
export const sendError = (
  res: Response, 
  message: string | unknown, 
  statusCode = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message: typeof message === 'string' ? message : 'An error occurred'
  });
}; 