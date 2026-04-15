// backend/app.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./auth";
import v1Router from "./api/v1";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { appConfig } from "./config/app.config";

// Rate limiter конфигурация
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 минут
const GENERAL_RATE_LIMIT = parseInt(process.env.GENERAL_RATE_LIMIT || '100', 10);
const AUTH_RATE_LIMIT = parseInt(process.env.AUTH_RATE_LIMIT || '5', 10);

// Строгий rate limiter для auth endpoints (защита от brute force)
const authRateLimiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  max: AUTH_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Слишком много попыток авторизации. Попробуйте позже.",
});

// Общий rate limiter для всех остальных запросов
const generalRateLimiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  max: GENERAL_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Слишком много запросов за короткое время. Попробуйте позже.",
});

export const createApp = () => {
  const app = express();

  // 1. CORS
  app.use(
    cors({
      origin: appConfig.cors.origin,
      credentials: appConfig.cors.credentials,
      methods: appConfig.cors.methods,
      allowedHeaders: appConfig.cors.allowedHeaders,
    }),
  );

  app.use(helmet());

  // 2. Auth rate limiter (применяется ТОЛЬКО к auth маршрутам)
  app.use("/api/auth", authRateLimiter);

  // 3. General rate limiter (для всех остальных маршрутов)
  app.use(generalRateLimiter);

  // 4. Better Auth
  app.all("/api/auth/{*path}", toNodeHandler(auth));

  // 5. JSON parser
  app.use(express.json({ limit: "10mb" }));

  // 6. URL-encoded parser (для form-data)
  app.use(express.urlencoded({ extended: true }));

  // 7. API v1 Routes
  app.use(appConfig.apiPrefix + "/v1", v1Router);

  // 8. 404 handler
  app.use(notFoundHandler);

  // 9. Error handler
  app.use(errorHandler);

  return app;
};
