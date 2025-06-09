import serverless from 'serverless-http';
import { createApp } from './app';
import prisma from './config/database';

// 创建 Express 应用
const app = createApp();

// 包装 handler 以管理数据库连接
const wrappedHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // 设置 context.callbackWaitsForEmptyEventLoop = false
  // 这样 Lambda 不会等待事件循环为空就返回
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // 执行实际的处理程序
    const result = await wrappedHandler(event, context);
    return result;
  } catch (error) {
    console.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An error occurred'
      })
    };
  }
}; 