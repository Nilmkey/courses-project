// backend/app.ts
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';

import { auth } from './auth';
import v1Router from './api/v1';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { appConfig } from './config/app.config';

export const createApp = () => {
  const app = express();

  // 1. CORS
  app.use(
    cors({
      origin: appConfig.cors.origin,
      credentials: appConfig.cors.credentials,
      methods: appConfig.cors.methods,
      allowedHeaders: appConfig.cors.allowedHeaders,
    })
  );

  // 2. Better Auth
  app.all('/api/auth/{*path}', toNodeHandler(auth));

  // 3. JSON parser
  app.use(express.json());

  // 4. API v1 Routes
  app.use(appConfig.apiPrefix + '/v1', v1Router);

  // 5. 404 handler
  app.use(notFoundHandler);

  // 6. Error handler
  app.use(errorHandler);

  return app;
};