function getEnv(key: string, required = true): string | undefined {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  PORT: getEnv("PORT") || "8000",
  NODE_ENV: getEnv("NODE_ENV") || "development",

  MONGO_URI: getEnv("MONGO_URI"),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN") || "1d",

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", false),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", false),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", false),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", false),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv(
    "FRONTEND_GOOGLE_CALLBACK_URL",
    false
  ),
};
