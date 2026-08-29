import { useCallback, useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import { getAuthUser, getErrorMessage } from "../utils/session";
import { STORAGE_KEYS } from "../constants/storageKeys";

function persistUser(user) {
  if (!user) return;
  const prev = getAuthUser() || {};
  const merged = {
    ...prev,
    ...user,
    id: user.id || prev.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || prev.name,
  };
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(merged));
  return merged;
}

/**
 * Load the authenticated user from GET /users/me (DB source of truth).
 * Falls back to session cache only while loading; never uses demo profile data.
 */
export default function useCurrentUser() {
  const [user, setUser] = useState(() => getAuthUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const me = await employeeService.getMe();
      const merged = persistUser(me);
      setUser(merged);
      return merged;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load profile"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const me = await employeeService.getMe();
        if (!active) return;
        setUser(persistUser(me));
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { user, loading, error, refresh, setUser };
}
