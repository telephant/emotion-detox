import { createRouter } from '../utils/routerUtils';
import { UserController } from '../controllers/userController';

// Create a router using our utility
const { router } = createRouter();

// User endpoints
router.post('/register', UserController.registerDevice);
router.get('/', UserController.getUserByDeviceId);

export default router; 