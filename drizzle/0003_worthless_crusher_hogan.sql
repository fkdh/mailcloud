ALTER TABLE "mail_senders" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "mail_senders" AS sender
SET "is_primary" = true
FROM "gmail_accounts" AS account
WHERE sender."gmail_account_id" = account."id"
  AND lower(sender."from_email") = lower(account."smtp_user");
--> statement-breakpoint
WITH missing_primary AS (
  SELECT
    account."tenant_id",
    account."id" AS "gmail_account_id",
    account."smtp_user",
    account."created_by",
    row_number() OVER (PARTITION BY account."tenant_id" ORDER BY account."created_at", account."id") AS "account_order",
    EXISTS (
      SELECT 1
      FROM "mail_senders" AS existing
      WHERE existing."tenant_id" = account."tenant_id"
        AND existing."is_default" = true
    ) AS "has_default"
  FROM "gmail_accounts" AS account
  WHERE NOT EXISTS (
    SELECT 1
    FROM "mail_senders" AS sender
    WHERE sender."gmail_account_id" = account."id"
      AND lower(sender."from_email") = lower(account."smtp_user")
  )
)
INSERT INTO "mail_senders" (
  "tenant_id", "gmail_account_id", "name", "from_email", "is_default", "is_primary", "created_by"
)
SELECT
  "tenant_id", "gmail_account_id", "smtp_user", "smtp_user",
  (NOT "has_default" AND "account_order" = 1), true, "created_by"
FROM missing_primary;
