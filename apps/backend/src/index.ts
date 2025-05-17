import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes';
import urgeRoutes from './routes/urgeRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/urges', urgeRoutes);
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled, allowing requests from any origin`);
});
