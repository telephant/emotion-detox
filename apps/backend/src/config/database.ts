import { PrismaClient } from '@prisma/client';

// Create a singleton PrismaClient instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:taoye@localhost:5432/emotion_detox?schema=public"
    }
  }
});

export default prisma;
