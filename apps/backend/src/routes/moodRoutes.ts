import { createMood, deleteMood, getMoodById, getUserMoods, updateMood } from '../controllers/moodController';
import { createRouter } from '../utils/routerUtils';

const { router } = createRouter();

// Create a new mood entry
router.post('/', createMood);

// Get all moods for a user
router.get('/user/:userId', getUserMoods);

// Get a specific mood by ID
router.get('/:moodId', getMoodById);

// Update a mood
router.put('/:moodId', updateMood);

// Delete a mood
router.delete('/:moodId', deleteMood);

export default router; 