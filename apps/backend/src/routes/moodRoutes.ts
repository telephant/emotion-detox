import { Router, IRouter } from 'express';
import { createMood, deleteMood, getMoodById, getUserMoods, updateMood } from '../controllers/moodController';

const router: IRouter = Router();

// Create a new mood entry
router.post('/', createMood as any);

// Get all moods for a user
router.get('/user/:userId', getUserMoods as any);

// Get a specific mood by ID
router.get('/:moodId', getMoodById as any);

// Update a mood
router.put('/:moodId', updateMood as any);

// Delete a mood
router.delete('/:moodId', deleteMood as any);

export default router; 