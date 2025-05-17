import { createRouter } from '../utils/routerUtils';
import { HealthController } from '../controllers/healthController';

const { router, get } = createRouter();

// Health check endpoint
get('/', HealthController.healthCheck);

export default router; 