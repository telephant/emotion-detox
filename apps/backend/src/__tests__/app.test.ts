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
  // Close db connection when done
  afterAll(async () => {
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
    // Clean up the test data after tests
    afterEach(async () => {
      // Delete test data - be careful with this in a production db!
      await prisma.urge.deleteMany({
        where: { userId: 'test-user' }
      });
    });

    it('should delay an urge and increment the count', async () => {
      const urgeData = {
        type: 'test-urge-type',
        userId: 'test-user'
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
        userId: 'test-user'
      };
      
      await request(app)
        .post('/api/urges/delay')
        .send(urgeData);

      // Now test the GET endpoint
      const response = await request(app)
        .get('/api/urges')
        .query({ userId: 'test-user' });

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