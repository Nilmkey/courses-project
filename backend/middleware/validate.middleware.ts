// middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, type ZodType } from 'zod';
import { AppError } from './error.middleware';

type ZodParsedOutput<T extends ZodType> = T extends ZodType<infer Output> ? Output : never;

export const validate = <T extends ZodSchema>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody as ZodParsedOutput<T>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(AppError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = <T extends ZodSchema>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsedQuery = schema.parse(req.query);
      Object.assign(req.query, parsedQuery);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(AppError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = <T extends ZodSchema>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsedParams = schema.parse(req.params);
      Object.assign(req.params, parsedParams);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(AppError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};