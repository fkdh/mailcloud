import "dotenv/config";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db, sql } from "../database";
import { tenants, users } from "./schema";

const requiredEnvironment = [
  "DATABASE_URL",
  "SUPERADMIN_NAME",
  "SUPERADMIN_EMAIL",
  "SUPERADMIN_PASSWORD",
] as const;

for (const key of requiredEnvironment) {
  if (!process.env[key]) {
    throw new Error(`${key} is required to seed the superadmin`);
  }
}

const email = process.env.SUPERADMIN_EMAIL!.trim().toLowerCase();
const existingTenant = await db.query.tenants.findFirst({
  where: eq(tenants.slug, "superadmin-workspace"),
});
const superadminTenant = existingTenant || (await db.insert(tenants).values({
  name: "Superadmin Workspace",
  slug: "superadmin-workspace",
  status: "ACTIVE",
}).returning({ id: tenants.id }))[0];
const existingUser = await db.query.users.findFirst({
  where: eq(users.email, email),
});

if (existingUser) {
  await db
    .update(users)
    .set({
      name: process.env.SUPERADMIN_NAME,
      role: "SUPERADMIN",
      status: "ACTIVE",
      tenantId: superadminTenant.id,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existingUser.id));

  console.log(`Superadmin already exists: ${email}`);
} else {
  const passwordHash = await argon2.hash(process.env.SUPERADMIN_PASSWORD!);

  await db.insert(users).values({
    name: process.env.SUPERADMIN_NAME!,
    email,
    passwordHash,
    role: "SUPERADMIN",
    status: "ACTIVE",
    tenantId: superadminTenant.id,
  });

  console.log(`Superadmin created: ${email}`);
}

await sql.end();
