// config/index.ts
export {
  connectDatabase,
  disconnectDatabase,
  getDatabaseConnection,
  isDatabaseConnected,
  type DatabaseConfig,
} from './database';

export {
  appConfig,
  getAppConfig,
  type ServerConfig,
  type CorsConfig,
  type AppConfig,
} from './app.config';