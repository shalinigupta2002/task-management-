/** Set to false when wiring real backend endpoints. */
export const USE_MOCK_API = false;

/**
 * API base URL (must include the `/api` prefix, no trailing slash).
 *
 * Local:  http://localhost:8080/api
 * Prod:   https://task-management-06db.onrender.com/api
 *
 * Override anytime with Vite env: VITE_API_BASE_URL
 * (set in `.env` locally, or in the Vercel project Environment Variables).
 */
const LOCAL_API_BASE_URL = "http://localhost:8080/api";
const PRODUCTION_API_BASE_URL = "https://task-management-06db.onrender.com/api";

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? LOCAL_API_BASE_URL
  : PRODUCTION_API_BASE_URL;

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

/** Simulated network delay for mock services (ms). */
export const MOCK_API_DELAY = 300;
