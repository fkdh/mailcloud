import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getUsers } from "../user-services";
import type { UserRecord } from "../user-types";

function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      setUsers(result.users);
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) window.location.href = "/login";
      else setError(requestError instanceof Error ? requestError.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { users, loading, error, reload: load };
}

export { useUsers };
