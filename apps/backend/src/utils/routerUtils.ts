import express, { Request, Response, NextFunction } from 'express';

// Use type assertion to handle Express 5.x router typings
export const createRouter = () => {
  const router: any = express.Router();
  
  // Wrap get method
  const safeGet = (
    path: string, 
    handler: (req: Request, res: Response, next?: NextFunction) => any
  ) => {
    return router.get(path, handler as any);
  };
  
  // Wrap post method
  const safePost = (
    path: string, 
    handler: (req: Request, res: Response, next?: NextFunction) => any
  ) => {
    return router.post(path, handler as any);
  };
  
  // Wrap put method
  const safePut = (
    path: string, 
    handler: (req: Request, res: Response, next?: NextFunction) => any
  ) => {
    return router.put(path, handler as any);
  };
  
  // Wrap delete method
  const safeDelete = (
    path: string, 
    handler: (req: Request, res: Response, next?: NextFunction) => any
  ) => {
    return router.delete(path, handler as any);
  };
  
  return {
    router,
    get: safeGet,
    post: safePost,
    put: safePut,
    delete: safeDelete
  };
}; 