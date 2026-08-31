import { deleteSession, getSessionUser, unauthorizedResponse } from "../auth";

export async function handleMe(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : null,
    },
  });
}

export async function handleLogout(request: Request) {
  return Response.json(
    { message: "Logout berhasil" },
    { headers: { "Set-Cookie": await deleteSession(request) } },
  );
}
