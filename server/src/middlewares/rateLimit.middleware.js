/**
 * In-memory rate limiter — safe for SINGLE-INSTANCE deployment only.
 *
 * Multi-replica production requires a shared store (Redis) or an API gateway
 * rate limiter. This implementation does not sync state across processes.
 *
 * TRUST_PROXY=true enables Express trust proxy (set in app.js). Enable ONLY when
 * the app runs behind a trusted reverse proxy (nginx, ALB). Do not enable on
 * directly exposed servers — clients could spoof X-Forwarded-For otherwise.
 */

const buckets = new Map();
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

function prune(key, windowMs) {
  const now = Date.now();
  const entries = buckets.get(key) || [];
  const fresh = entries.filter((ts) => now - ts < windowMs);
  if (fresh.length) buckets.set(key, fresh);
  else buckets.delete(key);
  return fresh;
}

function cleanupStaleBuckets(windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  for (const [key, entries] of buckets.entries()) {
    const fresh = entries.filter((ts) => now - ts < windowMs);
    if (fresh.length) buckets.set(key, fresh);
    else buckets.delete(key);
  }
}

const cleanupTimer = setInterval(() => cleanupStaleBuckets(), 5 * 60 * 1000);
if (typeof cleanupTimer.unref === "function") cleanupTimer.unref();

export function getClientIp(req) {
  if (process.env.TRUST_PROXY === "true") {
    return req.ip || req.socket?.remoteAddress || "unknown";
  }
  return req.socket?.remoteAddress || "unknown";
}

export function rateLimit({ windowMs = DEFAULT_WINDOW_MS, max = 20, keyFn }) {
  return (req, res, next) => {
    const key = keyFn(req);
    const hits = prune(key, windowMs);
    if (hits.length >= max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }
    hits.push(Date.now());
    buckets.set(key, hits);
    next();
  };
}

export const loginRateLimit = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 20,
  keyFn: (req) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    return `login:${getClientIp(req)}:${email}`;
  },
});

export default { rateLimit, loginRateLimit, getClientIp, cleanupStaleBuckets };
