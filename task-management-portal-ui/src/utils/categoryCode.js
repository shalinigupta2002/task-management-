/** Normalize category code: trim, uppercase, remove spaces. */
export function normalizeCategoryCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

const STOP_WORDS = new Set(["and", "the", "of", "for", "a", "an"]);

function tokenizeCategoryName(name) {
  return String(name || "")
    .trim()
    .split(/[\s&/\-–—,]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word.toLowerCase()));
}

/**
 * Generate a meaningful abbreviation from a category name.
 * Only intended for explicit user-triggered generation — never call on name change.
 */
export function generateCategoryCodeFromName(name) {
  const words = tokenizeCategoryName(name);
  if (words.length === 0) return "";

  if (words.length >= 2) {
    return words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 6);
  }

  const word = words[0].toUpperCase();
  if (word.length <= 4) return word;
  return word.length >= 8 ? word.slice(0, 4) : word.slice(0, 3);
}

/** Pick a unique code, appending 01, 02, … when the base is already taken. */
export function resolveUniqueCategoryCode(baseCode, existingCodes = [], excludeCode = null) {
  const normalized = normalizeCategoryCode(baseCode);
  if (!normalized) return null;

  const excluded = normalizeCategoryCode(excludeCode);
  const taken = new Set(
    existingCodes
      .map(normalizeCategoryCode)
      .filter((code) => code && code !== excluded)
  );

  if (!taken.has(normalized)) return normalized;

  for (let i = 1; i <= 99; i += 1) {
    const suffix = String(i).padStart(2, "0");
    const maxBaseLen = Math.max(2, 20 - suffix.length);
    const candidate = `${normalized.slice(0, maxBaseLen)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }

  return null;
}

export const CATEGORY_CODE_PATTERN = /^[A-Z0-9-]+$/;
