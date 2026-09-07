import path from "path";
import fs from "fs";
import dotenv from "dotenv";

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
