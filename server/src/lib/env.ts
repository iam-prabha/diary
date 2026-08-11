const required = [
  "DATABASE_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CORS_ORIGIN",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  CLOUDINARY_UPLOAD_PRESET:
    process.env.CLOUDINARY_UPLOAD_PRESET || "diary_unsigned",
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3001/api/auth/google/callback",
  SESSION_SECRET:
    process.env.SESSION_SECRET || "dev-insecure-secret-change-me",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

export const authConfigured = Boolean(googleClientId && googleClientSecret);
