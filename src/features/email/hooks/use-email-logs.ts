import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getEmailLogs } from "../services";
import type { EmailLog } from "../types";

function useEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getEmailLogs();
      setLogs(result.logs);
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) window.location.href = "/login";
      else setError(requestError instanceof Error ? requestError.message : "Could not load email history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { logs, loading, error, reload: load };
}

export { useEmailLogs };
