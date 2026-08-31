import { z } from "zod";

export const approvalSchema = z.object({
  userId: z.string().uuid(),
  decision: z.enum(["ACTIVE", "REJECTED"]),
});

export const userStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"]),
});
