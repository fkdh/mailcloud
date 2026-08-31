import { createFileRoute } from "@tanstack/react-router";
import { handleGmailOauthCallback } from "../../server/services/gmail-oauth";

export const Route = createFileRoute("/api/gmail/oauth/callback")({
  server: { handlers: { GET: ({ request }) => handleGmailOauthCallback(request) } },
});
