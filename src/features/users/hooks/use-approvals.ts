import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../components/ui/toast";
import { ApiError } from "../../../lib/api";
import { decideApproval, getApprovals } from "../services";
import type { Approval, ApprovalDecision } from "../types";

function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getApprovals();
      setApprovals(result.approvals);
      setMessage("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) window.location.href = "/login";
      else setMessage(error instanceof Error ? error.message : "Could not load approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function decide(userId: string, decision: ApprovalDecision) {
    try {
      const result = await decideApproval(userId, decision);
      setMessage(result.message);
      toast({ title: decision === "ACTIVE" ? "Admin disetujui" : "Admin ditolak", variant: "success" });
      await load();
    } catch (error) {
      const description = error instanceof Error ? error.message : "Approval gagal";
      setMessage(description);
      toast({ title: "Approval gagal", description, variant: "error" });
    }
  }

  return { approvals, loading, message, decide };
}

export { useApprovals };
