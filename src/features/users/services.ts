import { apiRequest } from "../../lib/api";
import type { Approval, ApprovalDecision } from "./types";

export function getApprovals() {
  return apiRequest<{ approvals: Approval[] }>("/api/admin/approvals");
}

export function decideApproval(userId: string, decision: ApprovalDecision) {
  return apiRequest<{ message: string }>("/api/admin/approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, decision }),
  });
}
