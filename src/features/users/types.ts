export type Approval = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  tenant: { id: string; name: string } | null;
};

export type ApprovalDecision = "ACTIVE" | "REJECTED";
