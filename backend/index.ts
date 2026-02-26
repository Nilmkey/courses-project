// backend/index.ts
import dotenv from 'dotenv';

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { appConfig } from './config/app.config';

dotenv.config();

const DB_URL: string = process.env.DB_URL || '';
const PORT: number = appConfig.server.port;

const startApp = async () => {
  try {
    // Подключение к БД
    await connectDatabase(DB_URL);

    // Создание приложения
    const app = createApp();

    // Запуск сервера
    app.listen(PORT, appConfig.server.host, () => {
      console.log('🚀 SERVER STARTED ON http://localhost:' + PORT);
      console.log('📚 API v1: http://localhost:' + PORT + '/api/v1');
      console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth');
      console.log('🌍 Environment: ' + appConfig.server.env);
    });
  } catch (error: unknown) {
    console.error('❌ ОШИБКА ПРИ ЗАПУСКЕ:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
};

startApp();