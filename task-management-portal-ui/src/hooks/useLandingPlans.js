import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchLandingPlans, getLandingPlansFromStorage } from "../utils/landingPlans";
import {
  PLANS_UPDATED_EVENT,
  PLANS_STORAGE_KEY,
} from "../utils/planEvents";

export default function useLandingPlans() {
  const location = useLocation();
  const [plans, setPlans] = useState(() => getLandingPlansFromStorage());
  const [loading, setLoading] = useState(() => getLandingPlansFromStorage().length === 0);

  const reload = useCallback(async () => {
    const cached = getLandingPlansFromStorage();
    if (cached.length > 0) {
      setPlans(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const data = await fetchLandingPlans();
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = getLandingPlansFromStorage();
      if (!cancelled && cached.length > 0) {
        setPlans(cached);
        setLoading(false);
      } else if (!cancelled) {
        setLoading(true);
      }

      const data = await fetchLandingPlans();
      if (!cancelled) {
        setPlans(data);
        setLoading(false);
      }
    };

    load();

    const onPlansUpdated = () => load();
    const onFocus = () => load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    const onStorage = (event) => {
      if (event.key === PLANS_STORAGE_KEY || event.key === null) load();
    };

    window.addEventListener(PLANS_UPDATED_EVENT, onPlansUpdated);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener(PLANS_UPDATED_EVENT, onPlansUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [location.pathname]);

  return { plans, loading, reload };
}
