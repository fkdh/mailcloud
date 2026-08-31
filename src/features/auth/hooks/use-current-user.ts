import { useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import { getCurrentUser } from "../services";
import type { CurrentUser } from "../types";

function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((result) => setUser(result.user))
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) window.location.href = "/login";
      });
  }, []);

  return user;
}

export { useCurrentUser };
