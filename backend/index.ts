
import mongoose from "mongoose";
import express from "express";
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL || "";
const app = express();


app.use(express.json());

const startApp = async () => {
  try {
    await mongoose.connect(DB_URL);
    app.listen(PORT, () => console.log("SERVER STARTED ON PORT " + PORT));
  } catch (e) {
    console.log(e);
  }
};
startApp();
