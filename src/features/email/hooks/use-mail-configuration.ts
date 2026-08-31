import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getMailConfiguration } from "../sender-services";
import type { MailConfiguration } from "../sender-types";

function useMailConfiguration() {
  const [configuration, setConfiguration] = useState<MailConfiguration>({ tenants: [], accounts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
       setConfiguration(await getMailConfiguration());
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) window.location.href = "/login";
      else setError(requestError instanceof Error ? requestError.message : "Could not load mail configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { ...configuration, loading, error, reload: load };
}

export { useMailConfiguration };
