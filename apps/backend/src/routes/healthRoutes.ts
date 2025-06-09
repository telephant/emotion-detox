import { Router, IRouter } from 'express';
import { HealthController } from '../controllers/healthController';

const router: IRouter = Router();

// Health check endpoint
router.get('/', HealthController.healthCheck as any);

export default router; 