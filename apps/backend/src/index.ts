import { createApp } from './app';
import serverless from 'serverless-http';

const app = createApp();
const PORT = process.env.PORT || 3000;

// Start server only when not in serverless environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS enabled, allowing requests from configured origins`);
  });
}

// Export the serverless handler
export const handler = serverless(app);

// Also export the app for local development
export default app;
