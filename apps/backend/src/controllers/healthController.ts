import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseFormatter';
import { Router } from 'express';

export const HealthController = {
  /**
   * Health check endpoint
   */
  healthCheck(req: Request, res: Response) {
    return sendSuccess(res, { status: 'ok' });
  }
};
