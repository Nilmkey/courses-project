import { MongoClient, Db } from "mongodb";
import "../config/loadEnv";

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error("❌ DB_URL не установлен в переменных окружения");
}

const client = new MongoClient(DB_URL!);
export const db: Db = client.db();
