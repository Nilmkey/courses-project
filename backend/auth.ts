import { betterAuth } from "better-auth";
import { db } from "./lib/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: "http://localhost:7777",
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      name: {
        type: "string",
      },
      //хз, надо, не надо роль тут. если че закоментишь
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
});

import { authClient } from "@/lib/auth-client";

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  streak: number;
  createdAt?: Date;
}

export type SessionData = typeof authClient.useSession;
