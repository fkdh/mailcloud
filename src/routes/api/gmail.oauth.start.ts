import { createFileRoute } from "@tanstack/react-router";
import { handleGmailOauthStart } from "../../server/services/gmail-oauth";

export const Route = createFileRoute("/api/gmail/oauth/start")({
  server: { handlers: { GET: ({ request }) => handleGmailOauthStart(request) } },
});
