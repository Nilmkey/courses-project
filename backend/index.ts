import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import router from "./TestRouter";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";
dotenv.config();

const DB_URL: string = process.env.DB_URL || "";
const PORT: number = parseInt(process.env.PORT || "7777");

const app = express();
// app.get("/", (req, res) => {
//   res.send("Бэкенд работает! База на связи.");
// });
app.use(express.json());
app.use("/test", router);
app.all("/api/auth/*", toNodeHandler(auth));

const startApp = async () => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SERVER STARTED ON http://0.0.0.0:${PORT}`);
    console.log(`Попробуйте открыть: http://localhost:${PORT}`);
  });

  try {
    await mongoose.connect(DB_URL);
    console.log("БАЗА ДАННЫХ ПОДКЛЮЧЕНА");
  } catch (e: any) {
    console.error("ОШИБКА ПОДКЛЮЧЕНИЯ К БД, но сервер всё равно живет:");
    console.log(e.message);
  }
};
startApp();
