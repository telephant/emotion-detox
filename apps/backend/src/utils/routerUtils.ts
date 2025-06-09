import express, { IRouter } from 'express';

// Simple router utility for Express 4.x
export const createRouter = (): { router: IRouter } => {
  const router = express.Router();
  
  return {
    router
  };
}; 