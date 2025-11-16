import { Router, IRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth, optionalAuth, requireAnonymousUser } from '../middleware/authMiddleware';

const router: IRouter = Router();

// Public authentication endpoints (no auth required)
router.post('/register', AuthController.register as any);
router.post('/login', AuthController.login as any);

// Anonymous user migration (allows anonymous users to register)
router.post('/migrate', AuthController.migrateAnonymousUser as any);

// Protected endpoints (require authentication)
router.get('/profile', requireAuth, AuthController.getProfile as any);
router.post('/refresh', requireAuth, AuthController.refreshToken as any);
router.post('/logout', requireAuth, AuthController.logout as any);

// Optional auth endpoint (works for both authenticated and anonymous users)
router.get('/check', optionalAuth, AuthController.checkAuth as any);

export default router;
