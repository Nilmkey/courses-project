import { betterAuth } from "better-auth";
import { db } from "./lib/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { StreakObj, ExtendedUser } from "./types";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: "http://localhost:7777",
  trustedOrigins: ["http://localhost:3000", "http://localhost:7777"],
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
        defaultValue: { count: 0, isFire: false, updateAt: new Date() },
      },
      image: {
        type: "string",
        required: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  cookie: {
    domain: "localhost",
    secure: false,
    sameSite: "lax",
    path: "/",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type { StreakObj, ExtendedUser };
