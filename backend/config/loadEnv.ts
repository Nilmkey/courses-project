import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import dns from "node:dns";

// Фикс ECONNREFUSED для MongoDB Atlas SRV-записей на домашних провайдерах и роутерах
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Игнорируем в средах, где переопределение DNS ограничено
}

// Ищем .env файл в корне проекта
const candidatePaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
];

const envPath = candidatePaths.find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

export const loadedEnvPath = envPath;
