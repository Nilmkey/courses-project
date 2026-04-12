import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

<<<<<<< HEAD
if (!process.env.DB_URL) {
  console.error("Нет DB_URL в .env");
}

const client = new MongoClient(process.env.DB_URL!);
export const db = client.db();
=======
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error("❌ DB_URL не установлен в переменных окружения");
}

const client = new MongoClient(DB_URL!);
export const db: Db = client.db();
>>>>>>> 761e16e7f650bc093d7f7dd1f9e44b6cb70157ef
