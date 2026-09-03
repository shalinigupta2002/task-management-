import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),
  databaseUrl: process.env.DATABASE_URL,
  /** Neon direct (non-pooled) URL — required for Prisma migrate via schema directUrl */
  databaseDirectUrl: process.env.DIRECT_URL,
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? (process.env.CORS_ORIGIN.includes(",")
          ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
          : process.env.CORS_ORIGIN.trim())
      : "*",
    credentials: true,
  },
  swagger: {
    enabled:
      process.env.SWAGGER_ENABLED === "true"
      || (process.env.NODE_ENV !== "production" && process.env.SWAGGER_ENABLED !== "false"),
  },
  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED !== "false",
    pollIntervalMs: parseInt(process.env.SCHEDULER_POLL_MS || "60000", 10),
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  tasks: {
    /** Days after today that count as "Tasks Nearing Due" (excludes today). Default 3 matches longest reminder interval. */
    nearingDueDays: parseInt(process.env.TASK_NEARING_DUE_DAYS || "3", 10),
  },
  payment: {
    hmacSecret: process.env.PAYMENT_HMAC_SECRET || process.env.JWT_SECRET || "dev-secret-change-me",
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || null,
  },
};

export default config;
