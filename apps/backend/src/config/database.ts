import { PrismaClient } from '@prisma/client';

// Log environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '(set)' : '(not set)');

const getDatabaseUrl = () => {
  // In production, DATABASE_URL must be set
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required in production');
  }

  // Only use default URL in development
  const baseUrl = process.env.DATABASE_URL || 
    (process.env.NODE_ENV !== 'production' 
      ? "postgresql://postgres:taoye@localhost:5432/emotion-detox?schema=public"
      : undefined);

  if (!baseUrl) {
    throw new Error('Database URL is not configured');
  }

  const poolConfig = "?pool_timeout=30&pool_max_connections=5&pool_min_connections=1";
  const finalUrl = baseUrl.includes('?') ? `${baseUrl}&${poolConfig.slice(1)}` : `${baseUrl}${poolConfig}`;
  console.log('Database URL:', finalUrl.replace(/:\/\/[^:]+:[^@]+@/, '://*:*@')); // Log URL with credentials masked
  return finalUrl;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database');
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
  });

export default prisma;
