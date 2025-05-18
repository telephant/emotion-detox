import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/healthRoutes';
import urgeRoutes from '../routes/urgeRoutes';
import prisma from '../config/database';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/urges', urgeRoutes);

describe('API Endpoint Tests', () => {
  // Test user ID
  let testUserId: string;

  // Setup test user before all tests
  beforeAll(async () => {
    // Create a test user with a unique device ID
    const testUser = await prisma.user.create({
      data: {
        deviceId: 'api-test-device-' + Date.now(),
      }
    });
    testUserId = testUser.id;
  });

  // Close db connection and cleanup when done
  afterAll(async () => {
    // Delete test user and any associated urges
    await prisma.urge.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  describe('Health Endpoint', () => {
    it('should return status OK', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'ok');
    });
  });

  describe('Urges Endpoints', () => {
    it('should delay an urge and increment the count', async () => {
      const urgeData = {
        type: 'test-urge-type',
        userId: testUserId
      };

      const response = await request(app)
        .post('/api/urges/delay')
        .send(urgeData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', urgeData.type);
      expect(response.body.data).toHaveProperty('userId', urgeData.userId);
      expect(response.body.data).toHaveProperty('count', 1);

      // Make a second request to test increment
      const secondResponse = await request(app)
        .post('/api/urges/delay')
        .send(urgeData);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.success).toBe(true);
      expect(secondResponse.body.data).toHaveProperty('count', 2);
    });

    it('should get urges for a specific user', async () => {
      // First, create a test urge
      const urgeData = {
        type: 'get-test-urge',
        userId: testUserId
      };
      
      await request(app)
        .post('/api/urges/delay')
        .send(urgeData);

      // Now test the GET endpoint
      const response = await request(app)
        .get('/api/urges')
        .query({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('urges');
      expect(Array.isArray(response.body.data.urges)).toBe(true);
      
      // Check that our test urge is in the results
      const testUrge = response.body.data.urges.find(
        (urge: any) => urge.type === urgeData.type && urge.userId === urgeData.userId
      );
      expect(testUrge).toBeDefined();
    });
  });
}); 