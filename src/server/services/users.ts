import { and, asc, eq } from "drizzle-orm";
import { db } from "../database";
import { tenants, users } from "../database/schema";
import { forbiddenResponse, getSessionUser, unauthorizedResponse } from "../auth";
import { approvalSchema, userStatusSchema } from "../../features/users/validation";

async function requireSuperadmin(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return { response: unauthorizedResponse() };
  if (user.role !== "SUPERADMIN") return { response: forbiddenResponse() };
  return { user };
}

export async function handleApprovalList(request: Request) {
  const auth = await requireSuperadmin(request);
  if (auth.response) return auth.response;

  const approvals = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      tenant: { id: tenants.id, name: tenants.name },
    })
    .from(users)
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(and(eq(users.role, "ADMIN"), eq(users.status, "PENDING")));

  return Response.json({ approvals });
}

export async function handleApprovalDecision(request: Request) {
  const auth = await requireSuperadmin(request);
  if (auth.response) return auth.response;

  try {
    const { userId, decision } = approvalSchema.parse(await request.json());
    const [approvedUser] = await db
      .update(users)
      .set({ status: decision, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.role, "ADMIN"), eq(users.status, "PENDING")))
      .returning({ id: users.id, tenantId: users.tenantId });

    if (!approvedUser) return Response.json({ message: "Approval tidak ditemukan" }, { status: 404 });

    if (decision === "ACTIVE" && approvedUser.tenantId) {
      await db.update(tenants)
        .set({ status: "ACTIVE", updatedAt: new Date() })
        .where(eq(tenants.id, approvedUser.tenantId));
    }

    return Response.json({ message: `Admin ${decision === "ACTIVE" ? "disetujui" : "ditolak"}` });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data approval tidak valid" }, { status: 400 });
    }
    console.error("Approval error:", error);
    return Response.json({ message: "Approval gagal" }, { status: 500 });
  }
}

export async function handleUserList(request: Request) {
  const auth = await requireSuperadmin(request);
  if (auth.response) return auth.response;

  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      tenant: { id: tenants.id, name: tenants.name },
    })
    .from(users)
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .orderBy(asc(users.createdAt));

  return Response.json({ users: userRows });
}

export async function handleUserStatusUpdate(request: Request, userId: string) {
  const auth = await requireSuperadmin(request);
  if (auth.response) return auth.response;
  if (userId === auth.user.id) return Response.json({ message: "Status akun superadmin sendiri tidak dapat diubah" }, { status: 403 });

  try {
    const { status } = userStatusSchema.parse(await request.json());
    const [updatedUser] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id, tenantId: users.tenantId });

    if (!updatedUser) return Response.json({ message: "User tidak ditemukan" }, { status: 404 });
    if (status === "ACTIVE" && updatedUser.tenantId) {
      await db.update(tenants).set({ status: "ACTIVE", updatedAt: new Date() }).where(eq(tenants.id, updatedUser.tenantId));
    }
    return Response.json({ message: "Status user berhasil diperbarui" });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Status user tidak valid" }, { status: 400 });
    }
    console.error("User status update error:", error);
    return Response.json({ message: "Status user gagal diperbarui" }, { status: 500 });
  }
}

export async function handleUserDelete(request: Request, userId: string) {
  const auth = await requireSuperadmin(request);
  if (auth.response) return auth.response;
  if (userId === auth.user.id) return Response.json({ message: "Akun superadmin sendiri tidak dapat dihapus" }, { status: 403 });

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!deletedUser) return Response.json({ message: "User tidak ditemukan" }, { status: 404 });
  return Response.json({ message: "User berhasil dihapus" });
}
