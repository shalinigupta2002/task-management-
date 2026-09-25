import config from "./index.js";

const INSECURE_JWT_SECRETS = new Set([
  "dev-secret-change-me",
  "your-super-secret-jwt-key-change-in-production",
]);

export function validateProductionEnv() {
  if (config.env !== "production") return;

  const missing = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.DIRECT_URL) missing.push("DIRECT_URL");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!process.env.CORS_ORIGIN) missing.push("CORS_ORIGIN");

  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (INSECURE_JWT_SECRETS.has(process.env.JWT_SECRET)) {
    throw new Error("JWT_SECRET must be set to a strong unique value in production");
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  const cors = process.env.CORS_ORIGIN?.trim();
  if (!cors || cors === "*" || cors.split(",").map((s) => s.trim()).includes("*")) {
    throw new Error(
      "CORS_ORIGIN must be an explicit frontend origin in production (wildcard * is not allowed)"
    );
  }

  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  if (!hasRazorpay && process.env.ALLOW_INTERNAL_PAYMENT !== "true") {
    throw new Error(
      "Production requires RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET, or explicit ALLOW_INTERNAL_PAYMENT=true for staging-only INTERNAL checkout"
    );
  }
}

export default validateProductionEnv;
