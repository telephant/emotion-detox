import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import healthRoutes from './routes/healthRoutes';
import urgeRoutes from './routes/urgeRoutes';
import userRoutes from './routes/userRoutes';
import moodRoutes from './routes/moodRoutes';

/**
 * Creates and configures the Express application
 * This factory function can be used by both serverless and traditional server setups
 */
export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors(corsOptions)); // Use configured CORS options
  app.use(express.json());

  // Add request logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/urges', urgeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/moods', moodRoutes);

  // Root route for API
  app.get('/', (req, res) => {
    res.json({
      message: 'Emotion Detox API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method
    });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  return app;
}

export default createApp; 