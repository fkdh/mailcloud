import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSessionUser } from "../../server/auth";

export const getAuthenticationState = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser(getRequest());
  return { authenticated: Boolean(user) };
});
