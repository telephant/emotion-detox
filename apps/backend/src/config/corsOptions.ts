import { CorsOptions } from 'cors';

/**
 * CORS configuration options
 * You can customize these settings if you need more specific CORS rules
 */
const corsOptions: CorsOptions = {
  // Allow requests from all origins in development
  origin: true,
  
  // Allow specific origins in production
  // origin: ['https://your-app-domain.com', 'https://www.your-app-domain.com'],
  
  // Allow all common HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allow these headers in requests
  allowedHeaders: ['Content-Type', 'Authorization'],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // How long the results of a preflight request can be cached (in seconds)
  maxAge: 86400, // 24 hours
};

export default corsOptions; 