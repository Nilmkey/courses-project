import { betterAuth } from "better-auth";
import { db } from "./lib/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { StreakObj, ExtendedUser } from "./types";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:7777";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function createIndexes() {
  await db.collection("user").createIndex({ email: 1 }, { unique: true });
  await db.collection("user").createIndex({ role: 1 });
}

async function initAuth() {
  console.log("Create Indexes...");
  await createIndexes();
  console.log("indexes done!!!!");
}

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: BACKEND_URL,
  trustedOrigins: [FRONTEND_URL, BACKEND_URL],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      name: {
        type: "string",
      },
      role: {
        type: "string",
        defaultValue: "student",
      },
      streak: {
        type: "json",
        defaultValue: { count: 0, isFire: false, updatedAt: new Date() },
      },
      image: {
        type: "string",
        required: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  cookie: {
    // В production domain должен быть задан явно (например, yourdomain.com)
    // В development оставляем undefined — браузер будет использовать текущий домен
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

initAuth();

export type { StreakObj, ExtendedUser };
