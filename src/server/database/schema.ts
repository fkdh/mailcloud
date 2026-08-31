import {
  index,
  integer,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["SUPERADMIN", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "SUSPENDED",
]);
export const tenantStatusEnum = pgEnum("tenant_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
]);
export const emailLogStatusEnum = pgEnum("email_log_status", [
  "SENT",
  "FAILED",
]);
export const gmailAccountStatusEnum = pgEnum("gmail_account_status", [
  "ACTIVE",
  "DISABLED",
]);
export const gmailAuthTypeEnum = pgEnum("gmail_auth_type", [
  "APP_PASSWORD",
  "OAUTH",
]);
export const mailSenderStatusEnum = pgEnum("mail_sender_status", [
  "ACTIVE",
  "DISABLED",
]);

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    status: tenantStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("tenants_slug_unique").on(table.slug),
  }),
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("ADMIN").notNull(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    status: userStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    tenantIndex: index("users_tenant_id_idx").on(table.tenantId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    userIndex: index("sessions_user_id_idx").on(table.userId),
    expiresIndex: index("sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export const gmailAccounts = pgTable(
  "gmail_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 120 }).notNull(),
    smtpUser: varchar("smtp_user", { length: 320 }).notNull(),
    authType: gmailAuthTypeEnum("auth_type").default("APP_PASSWORD").notNull(),
    encryptedAppPassword: text("encrypted_app_password"),
    encryptionIv: varchar("encryption_iv", { length: 32 }),
    encryptionTag: varchar("encryption_tag", { length: 32 }),
    encryptedAccessToken: text("encrypted_access_token"),
    accessTokenIv: varchar("access_token_iv", { length: 32 }),
    accessTokenTag: varchar("access_token_tag", { length: 32 }),
    encryptedRefreshToken: text("encrypted_refresh_token"),
    refreshTokenIv: varchar("refresh_token_iv", { length: 32 }),
    refreshTokenTag: varchar("refresh_token_tag", { length: 32 }),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    status: gmailAccountStatusEnum("status").default("ACTIVE").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantUserUnique: uniqueIndex("gmail_accounts_tenant_user_unique").on(table.tenantId, table.smtpUser),
    tenantIndex: index("gmail_accounts_tenant_id_idx").on(table.tenantId),
  }),
);

export const gmailOauthStates = pgTable(
  "gmail_oauth_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stateHash: varchar("state_hash", { length: 64 }).notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    stateHashUnique: uniqueIndex("gmail_oauth_states_hash_unique").on(table.stateHash),
    userIndex: index("gmail_oauth_states_user_id_idx").on(table.userId),
    expiresIndex: index("gmail_oauth_states_expires_idx").on(table.expiresAt),
  }),
);

export const mailSenders = pgTable(
  "mail_senders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    gmailAccountId: uuid("gmail_account_id")
      .notNull()
      .references(() => gmailAccounts.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    fromEmail: varchar("from_email", { length: 320 }).notNull(),
    status: mailSenderStatusEnum("status").default("ACTIVE").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantEmailUnique: uniqueIndex("mail_senders_tenant_email_unique").on(table.tenantId, table.fromEmail),
    tenantIndex: index("mail_senders_tenant_id_idx").on(table.tenantId),
    accountIndex: index("mail_senders_account_id_idx").on(table.gmailAccountId),
  }),
);

export const emailLogs = pgTable(
  "email_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    senderId: uuid("sender_id").references(() => mailSenders.id, { onDelete: "set null" }),
    fromEmail: varchar("from_email", { length: 320 }),
    recipient: varchar("recipient", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 998 }).notNull(),
    text: text("text").notNull(),
    status: emailLogStatusEnum("status").notNull(),
    errorMessage: text("error_message"),
    attemptCount: integer("attempt_count").default(1).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantCreatedIndex: index("email_logs_tenant_created_idx").on(
      table.tenantId,
      table.createdAt,
    ),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type GmailAccount = typeof gmailAccounts.$inferSelect;
export type NewGmailAccount = typeof gmailAccounts.$inferInsert;
export type MailSender = typeof mailSenders.$inferSelect;
export type NewMailSender = typeof mailSenders.$inferInsert;
