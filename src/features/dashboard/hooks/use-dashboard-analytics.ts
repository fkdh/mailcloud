import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getDashboardAnalytics } from "../services";
import type { DashboardAnalytics } from "../types";

const initialAnalytics: DashboardAnalytics = {
  sentToday: 0,
  sent: 0,
  failed: 0,
  deliveryRate: null,
  activeSenders: 0,
};

function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAnalytics(await getDashboardAnalytics());
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) window.location.href = "/login";
      else setError(requestError instanceof Error ? requestError.message : "Could not load dashboard analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { analytics, loading, error, reload: load };
}

export { useDashboardAnalytics };
