import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

// You can also load from prisma .env if needed
try {
  config({ path: path.resolve(process.cwd(), 'src/prisma/.env') });
} catch (error) {
  // It's okay if this file doesn't exist
}

// Log to verify we have database URL
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ No DATABASE_URL environment variable found. Database tests may fail.');
} 