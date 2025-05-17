import prisma from '../config/database';

describe('Database Connection Tests', () => {
  // Close the database connection after all tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database', async () => {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
  });

  it('should have access to the Urge model', async () => {
    // Try to access the model - this will fail if table doesn't exist
    // but we're just checking that the client can access the model
    expect(prisma.urge).toBeDefined();
  });
}); 