import ApiError from "./ApiError.js";

const BLOCKED_PROTOCOLS = new Set(["http:", "javascript:", "data:", "file:"]);

/**
 * Validates external attachment/document URLs.
 * Only HTTPS URLs are permitted.
 */
export function validateSecureHttpsUrl(urlString) {
  if (urlString == null || urlString === "") return null;

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw ApiError.badRequest("Invalid URL format");
  }

  if (BLOCKED_PROTOCOLS.has(parsed.protocol) || parsed.protocol !== "https:") {
    throw ApiError.badRequest("Only secure HTTPS links are allowed");
  }

  return parsed.href;
}

export default { validateSecureHttpsUrl };
