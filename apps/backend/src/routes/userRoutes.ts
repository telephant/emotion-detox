import { Router, IRouter } from 'express';
import { UserController } from '../controllers/userController';

const router: IRouter = Router();

// User endpoints
router.post('/register', UserController.registerDevice as any);
router.get('/', UserController.getUserByDeviceId as any);

export default router; 