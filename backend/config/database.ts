// config/database.ts
import mongoose from 'mongoose';

export interface DatabaseConfig {
  url: string;
  options?: mongoose.ConnectOptions;
}

export const connectDatabase = async (url: string): Promise<void> => {
  try {
    await mongoose.connect(url);
    console.log('✅ БАЗА ДАННЫХ ПОДКЛЮЧЕНА');
  } catch (error) {
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ К БД:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('🔌 БАЗА ДАННЫХ ОТКЛЮЧЕНА');
};

export const getDatabaseConnection = (): mongoose.Connection => {
  return mongoose.connection;
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};