import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  console.error("Нет DB_URL в .env");
}

const client = new MongoClient(process.env.DB_URL!);
export const db = client.db();