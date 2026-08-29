/** Set to false when wiring real backend endpoints. */
export const USE_MOCK_API = false;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Simulated network delay for mock services (ms). */
export const MOCK_API_DELAY = 300;
