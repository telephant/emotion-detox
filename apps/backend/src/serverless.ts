import serverless from 'serverless-http';
import { createApp } from './app';

// Create the Express app
const app = createApp();

// Configure serverless-http options
const serverlessOptions = {
  // Handle binary content types (for file uploads, images, etc.)
  binary: [
    'application/octet-stream',
    'application/pdf',
    'image/*',
    'video/*',
    'audio/*'
  ],
  
  // Strip the base path from API Gateway stage
  basePath: undefined,
  
  // Request/response transformation
  request(request: any, event: any, context: any) {
    // Add Lambda context to request for potential use in routes
    request.lambdaEvent = event;
    request.lambdaContext = context;
    
    // Log the incoming request for debugging
    console.log(`Lambda Request: ${request.method} ${request.url}`);
  },
  
  response(response: any, event: any, context: any) {
    // Log the response for debugging
    console.log(`Lambda Response: ${response.statusCode}`);
  }
};

// Export the handler for AWS Lambda
export const handler = serverless(app, serverlessOptions); 