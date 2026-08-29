export function isValidExternalUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeExternalUrl(value) {
  return String(value || "").trim();
}

export function getUrlDisplayName(url, fallback = "Attachment") {
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return fallback;

  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.includes("drive.google.com")) {
      return "Google Drive Link";
    }
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
    return parsed.hostname || fallback;
  } catch {
    return fallback;
  }
}

export function inferAttachmentType(url) {
  const lower = normalizeExternalUrl(url).toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|#|$)/i.test(lower)) return "image";
  if (/\.(mp4|webm|mov|avi|mkv)(\?|#|$)/i.test(lower)) return "video";
  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) {
    return "video";
  }
  return "document";
}

export function getAttachmentOpenLabel(type) {
  if (type === "image") return "View Image";
  if (type === "video") return "Open Video";
  return "Open Link";
}
