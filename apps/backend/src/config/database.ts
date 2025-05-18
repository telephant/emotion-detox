import { PrismaClient } from '@prisma/client';

// Create a singleton PrismaClient instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:taoye@localhost:5432/emotion_detox?schema=public"
    }
  },
  log: ['error', 'warn'],
});

// Log error details when connecting to the database
prisma.$connect()
  .then(() => {
    console.log('✅ Successfully connected to the database');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to the database:', error);
  });

export default prisma;
