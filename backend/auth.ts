import { betterAuth } from "better-auth";
import { db } from "./lib/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

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
        type: "number",
        defaultValue: 0,
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
    cookieName: "better-auth.session_token",
  },
});

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "student" | "teacher" | "admin";
  streak: number;
  createdAt?: Date;
}
