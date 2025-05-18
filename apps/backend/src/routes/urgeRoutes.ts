import { createRouter } from '../utils/routerUtils';
import { UrgeController } from '../controllers/urgeController';

// Create a router using our utility
const { router } = createRouter();

// Urge endpoints
router.post('/delay', UrgeController.delayUrge);
router.post('/update', UrgeController.updateUrgeStatus);
router.get('/', UrgeController.getUrges);
router.get('/stats', UrgeController.getUrgeStats);
router.get('/emotion-map', UrgeController.getEmotionMapData);

export default router; 