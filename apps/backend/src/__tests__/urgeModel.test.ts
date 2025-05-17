import { UrgeModel } from '../models/urgeModel';
import prisma from '../config/database';

describe('Urge Model Tests', () => {
  // Clean up after all tests
  afterAll(async () => {
    // Delete test data
    await prisma.urge.deleteMany({
      where: { userId: 'model-test-user' }
    });
    await prisma.$disconnect();
  });

  it('should create a new urge when delaying for the first time', async () => {
    const urgeData = {
      type: 'model-test-urge',
      userId: 'model-test-user'
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
      userId: 'model-test-user'
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
      userId: 'model-test-user'
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
}); 