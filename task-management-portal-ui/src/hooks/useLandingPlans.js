import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchLandingPlans } from "../utils/landingPlans";
import {
  PLANS_UPDATED_EVENT,
  PLANS_STORAGE_KEY,
} from "../utils/planEvents";

/**
 * Shared landing-plans hook (kept for non-Pricing callers).
 * Always clears loading in `finally` so a cancelled Strict Mode pass cannot
 * leave consumers stuck on a loading spinner.
 */
export default function useLandingPlans() {
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignoreResult = false;

    const run = async (showLoading) => {
      if (showLoading) setLoading(true);
      try {
        const data = await fetchLandingPlans();
        if (!ignoreResult) setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("useLandingPlans load failed", err);
        if (!ignoreResult) setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    run(true);

    const onPlansUpdated = () => run(false);
    const onStorage = (event) => {
      if (event.key === PLANS_STORAGE_KEY || event.key === null) run(false);
    };
    window.addEventListener(PLANS_UPDATED_EVENT, onPlansUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      ignoreResult = true;
      window.removeEventListener(PLANS_UPDATED_EVENT, onPlansUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [location.pathname]);

  return {
    plans,
    loading,
    reload: () => {
      fetchLandingPlans()
        .then((data) => setPlans(Array.isArray(data) ? data : []))
        .catch(() => setPlans([]));
    },
  };
}
