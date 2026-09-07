// config/app.config.ts
export interface ServerConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
}

export interface CorsConfig {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
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

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const configuredOrigin = getEnv('CORS_ORIGIN', 'http://localhost:3000');
  const frontendUrl = getEnv('FRONTEND_URL', 'http://localhost:3000');
  const allowed = [
    configuredOrigin,
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:7777',
    'http://127.0.0.1:7777',
  ];
  return (
    allowed.includes(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
  );
};

export const appConfig: AppConfig = {
  server: {
    port: getEnvNumber('PORT', 7777),
    host: getEnv('HOST', '0.0.0.0'),
    env: (getEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  },
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'better-auth-agent',
      'x-better-auth-version',
      'x-csrf-token',
      'baggage',
      'sentry-trace',
      'traceparent',
    ],
  },
  apiPrefix: '/api',
};

export const getAppConfig = (): AppConfig => appConfig;