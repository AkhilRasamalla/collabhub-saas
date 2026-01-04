import { getEnv } from "../utils/get-env";

export const config = {
  PORT: getEnv("PORT") || "8000",
  NODE_ENV: getEnv("NODE_ENV") || "production",

  BASE_PATH: "/api",

  MONGO_URI: getEnv("MONGO_URI"),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  FRONTEND_GOOGLE_CALLBACK_URL: process.env.FRONTEND_GOOGLE_CALLBACK_URL,
};
