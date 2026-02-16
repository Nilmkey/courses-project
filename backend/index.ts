import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./auth";

import router from "./routers/CoursesRouter";

dotenv.config();

const DB_URL: string = process.env.DB_URL || "";
const PORT: number = parseInt(process.env.PORT || "7777");

const app = express();

// 1. Настройка CORS (Должна быть ПЕРВОЙ)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. Better Auth обработчик
// Используем '*', чтобы Better Auth сам разбирал пути внутри /api/auth
app.all("/api/auth/{*path}", toNodeHandler(auth));

// 3. Middlewares для обычных роутов
app.use(express.json());

app.use("/api/courses", router); // CRUD курсов

// Функция запуска
const startApp = async () => {
  try {
    // Сначала база, потом сервер — так надежнее
    await mongoose.connect(DB_URL);
    console.log("✅ БАЗА ДАННЫХ ПОДКЛЮЧЕНА");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SERVER STARTED ON http://localhost:${PORT}`);
      console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
    });
  } catch (e: any) {
    console.error("❌ ОШИБКА ПРИ ЗАПУСКЕ:");
    console.log(e.message);
    process.exit(1); // Если база не в сети, лучше упасть сразу
  }
};

startApp();
