import { STORAGE_KEYS } from "../constants/storageKeys";

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCompanyId() {
  const user = getAuthUser();
  if (user?.companyId) return user.companyId;
  const stored = localStorage.getItem("companyId");
  return stored || null;
}

export function getDepartmentId() {
  const user = getAuthUser();
  return user?.departmentId || null;
}

export function getUserRole() {
  const user = getAuthUser();
  return user?.role?.name || user?.role || null;
}

export function isSubAdminUser() {
  return getUserRole() === "SUB_ADMIN";
}

/** Unwrap TaskFlow API envelope { success, data, meta } */
export function unwrapResponse(response) {
  const body = response?.data ?? response;
  if (body && typeof body === "object" && "success" in body) {
    return body;
  }
  return { success: true, data: body, meta: undefined };
}

export function unwrapData(response) {
  return unwrapResponse(response).data;
}

export function unwrapList(response) {
  const body = unwrapResponse(response);
  const payload = body.data;
  if (Array.isArray(payload)) {
    return { items: payload, meta: body.meta };
  }
  if (payload && Array.isArray(payload.items)) {
    return { items: payload.items, meta: payload.meta ?? body.meta };
  }
  return { items: [], meta: body.meta };
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message
    || error?.message
    || fallback
  );
}

export function toDisplayStatus(status) {
  if (!status) return "Active";
  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "Inactive";
  return status;
}

export function toApiStatus(displayStatus) {
  if (displayStatus === "Active") return "ACTIVE";
  if (displayStatus === "Inactive") return "INACTIVE";
  return displayStatus;
}

export function normalizeCategoryCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function toDisplayCode(label) {
  if (!label) return "—";
  return label.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "—";
}

export function formatDaysInterval(days) {
  if (days == null) return "—";
  if (days === 1) return "Every 1 day";
  if (days === 7) return "Every 1 week";
  if (days === 30) return "Every 1 month";
  if (days === 90) return "Every 3 months";
  if (days === 182) return "Every 6 months";
  if (days === 365) return "Every 1 year";
  return `Every ${days} day(s)`;
}
