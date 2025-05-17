import { Router as ExpressRouter } from 'express';

declare module 'express' {
  interface Router extends ExpressRouter {}
} 