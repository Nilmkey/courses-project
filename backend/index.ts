import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./auth";
import router from "./routers/CoursesRouter";
import { errorHandler, createError } from "./middleware/errorHandler";

dotenv.config();

const DB_URL: string = process.env.DB_URL || "";
const PORT: number = parseInt(process.env.PORT || "7777");

const app = express();

// 1. CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. Better Auth
app.all("/api/auth/{*path}", toNodeHandler(auth));

// 3. Middlewares
app.use(express.json());

// 4. Роуты
app.use("/api/courses", router);

// 5. ErrorHandler (после всех роутов!)
app.use(errorHandler);

// 6. Обработка 404
app.use((req, res, next) => {
  next(createError.notFound(`Маршрут ${req.method} ${req.path} не найден`));
});

// Запуск
const startApp = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ БАЗА ДАННЫХ ПОДКЛЮЧЕНА");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SERVER STARTED ON http://localhost:${PORT}`);
      console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
    });
  } catch (e: unknown) {
    console.error("❌ ОШИБКА ПРИ ЗАПУСКЕ:");
    if (e instanceof Error) {
      console.log(e.message);
    }
    process.exit(1);
  }
};

startApp();
