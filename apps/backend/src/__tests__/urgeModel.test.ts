import { UrgeModel } from '../models/urgeModel';
import prisma from '../config/database';
import { UrgeStatus } from '@repo/shared-types';

describe('Urge Model Tests', () => {
  // Create a test user ID to use across tests
  let testUserId: string;

  // Set up test user
  beforeAll(async () => {
    // Create a test user first
    const testUser = await prisma.user.create({
      data: {
        deviceId: 'test-device-' + Date.now(),
      }
    });
    testUserId = testUser.id;
  });

  // Clean up after all tests
  afterAll(async () => {
    // Delete test data
    await prisma.urge.deleteMany({
      where: { 
        OR: [
          { userId: testUserId },
          { userId: 'model-test-user' },
          { userId: null, type: { startsWith: 'model-test' } }
        ]
      }
    });
    // Delete test user
    await prisma.user.delete({
      where: { id: testUserId }
    });
    await prisma.$disconnect();
  });

  it('should create a new urge when delaying for the first time', async () => {
    const urgeData = {
      type: 'model-test-urge',
      userId: testUserId
    };

    const result = await UrgeModel.delayUrge(urgeData);

    expect(result.success).toBe(true);
    expect(result.urge).toHaveProperty('type', urgeData.type);
    expect(result.urge).toHaveProperty('userId', urgeData.userId);
    expect(result.urge).toHaveProperty('count', 1);
    expect(result.urge).toHaveProperty('id');
    expect(result.urge).toHaveProperty('createTime');
    expect(result.urge).toHaveProperty('updateTime');
  });

  it('should increment the count when delaying an existing urge', async () => {
    const urgeData = {
      type: 'model-test-urge-increment',
      userId: testUserId
    };

    // First delay to create
    await UrgeModel.delayUrge(urgeData);
    
    // Second delay to increment
    const result = await UrgeModel.delayUrge(urgeData);

    expect(result.success).toBe(true);
    expect(result.urge).toHaveProperty('count', 2);
  });

  it('should fetch urges for a specific user', async () => {
    const urgeData = {
      type: 'model-test-fetch',
      userId: testUserId
    };

    // Create a test urge
    await UrgeModel.delayUrge(urgeData);
    
    // Fetch urges
    const urges = await UrgeModel.getUrges(urgeData.userId);
    
    expect(Array.isArray(urges)).toBe(true);
    expect(urges.length).toBeGreaterThan(0);
    
    // Check if our test urge is in the results
    // @ts-ignore: We know the structure of the urge object
    const testUrge = urges.find((urge) => 
      urge.type === urgeData.type && urge.userId === urgeData.userId
    );
    expect(testUrge).toBeDefined();
  });

  it('should fetch emotion map data with correct status counts by date', async () => {
    // Use the testUserId created in beforeAll
    const userId = testUserId;
    
    // Create test urges with different statuses on the same day
    const testDate = new Date();
    const testType = 'model-test-emotion-map';
    
    // Create urges with different statuses
    await prisma.urge.create({
      data: {
        type: testType,
        userId,
        status: UrgeStatus.PEACEFUL,
        count: 1,
        createTime: testDate,
      },
    });
    
    await prisma.urge.create({
      data: {
        type: testType,
        userId,
        status: UrgeStatus.PRESENT,
        count: 1,
        createTime: testDate,
      },
    });
    
    await prisma.urge.create({
      data: {
        type: testType,
        userId,
        status: UrgeStatus.OVERCOME,
        count: 1,
        createTime: testDate,
      },
    });
    
    // Get emotion map data - pass userId to get only our test data
    const emotionData = await UrgeModel.getEmotionMapData(userId, 1); // Just look at the last week
    
    // Expected date string for test date
    const dateString = testDate.toISOString().split('T')[0];
    
    // Basic validation
    expect(emotionData).toHaveProperty('dailyData');
    expect(emotionData).toHaveProperty('totalDays');
    expect(Array.isArray(emotionData.dailyData)).toBe(true);
    
    // Find our test day in the results
    const testDay = emotionData.dailyData.find(day => day.date === dateString);
    expect(testDay).toBeDefined();
    
    if (testDay) {
      // Verify counts for each status
      expect(testDay.counts).toHaveProperty(UrgeStatus.PEACEFUL, 1);
      expect(testDay.counts).toHaveProperty(UrgeStatus.PRESENT, 1);
      expect(testDay.counts).toHaveProperty(UrgeStatus.OVERCOME, 1);
      expect(testDay.counts).toHaveProperty('total', 3);
    }
  });
  
  it('should handle empty results in emotion map data', async () => {
    // Use a random UUID that won't exist in the database but is still a valid format
    const nonExistentId = '00000000-0000-4000-a000-000000000000';
    
    const emotionData = await UrgeModel.getEmotionMapData(nonExistentId, 1);
    
    expect(emotionData).toHaveProperty('dailyData');
    expect(emotionData).toHaveProperty('totalDays', 0);
    expect(Array.isArray(emotionData.dailyData)).toBe(true);
    expect(emotionData.dailyData.length).toBe(0);
  });
}); 