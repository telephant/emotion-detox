import prisma from '../src/config/database';

async function testRdsConnection() {
  try {
    console.log('Testing RDS connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to RDS');

    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Successfully executed test query:', result);

    // Test model access
    const models = Object.keys(prisma);
    console.log('✅ Available models:', models.filter(key => !key.startsWith('$')));

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRdsConnection(); 