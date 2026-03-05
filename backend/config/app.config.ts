// config/app.config.ts
export interface ServerConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
}

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface AppConfig {
  server: ServerConfig;
  cors: CorsConfig;
  apiPrefix: string;
}

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

export const appConfig: AppConfig = {
  server: {
    port: getEnvNumber('PORT', 7777),
    host: getEnv('HOST', '0.0.0.0'),
    env: (getEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  },
  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  apiPrefix: '/api',
};

export const getAppConfig = (): AppConfig => appConfig;