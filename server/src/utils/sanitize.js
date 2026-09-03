/** Strip sensitive fields from user objects */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * Redacts sensitive credentials (passwords, connection strings with auth, secrets) from log output.
 */
export function sanitizeForLog(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return data
      // Redact passwords in database connection strings: postgresql://user:pass@host -> postgresql://user:***@host
      .replace(/([a-zA-Z0-9\+\.-]+:\/\/[^:]+:)[^@\s]+(@)/g, "$1***$2")
      // Redact password parameters: password='xxx', "password": "xxx", or password=xxx
      .replace(/("?'?password"?'?\s*[:=]\s*["']?)([^"'&\s]+)(["']?)/gi, "$1***$3")
      // Redact secret parameters: secret='xxx', "secret": "xxx", or secret=xxx
      .replace(/("?'?secret"?'?\s*[:=]\s*["']?)([^"'&\s]+)(["']?)/gi, "$1***$3");
  }

  if (data instanceof Error) {
    const name = data.name || "Error";
    const msg = sanitizeForLog(data.message || "");
    const stack = sanitizeForLog(data.stack || "");
    return `${name}: ${msg}${stack ? `\n${stack}` : ""}`;
  }

  if (typeof data === "object") {
    try {
      const str = JSON.stringify(data, (key, value) => {
        if (/password|secret|token|auth/i.test(key) && typeof value === "string") {
          return "***";
        }
        return value;
      });
      return sanitizeForLog(str);
    } catch (_e) {
      return "[Unserializable Object]";
    }
  }

  return data;
}

export default sanitizeUser;

