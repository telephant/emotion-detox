import { Router, IRouter } from 'express';
import { UrgeController } from '../controllers/urgeController';

const router: IRouter = Router();

// Urge endpoints
router.post('/delay', UrgeController.delayUrge as any);
router.post('/update', UrgeController.updateUrgeStatus as any);
router.get('/', UrgeController.getUrges as any);
router.get('/stats', UrgeController.getUrgeStats as any);
router.get('/emotion-map', UrgeController.getEmotionMapData as any);

export default router; 