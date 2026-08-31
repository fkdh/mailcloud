export type MailSender = {
  id: string;
  tenantId: string;
  tenantName: string;
  gmailAccountId: string;
  name: string;
  fromEmail: string;
  status: "ACTIVE" | "DISABLED";
  isDefault: boolean;
  isPrimary: boolean;
};

export type GmailAccount = {
  id: string;
  tenantId: string;
  tenantName: string;
  label: string;
  smtpUser: string;
  authType: "APP_PASSWORD" | "OAUTH";
  status: "ACTIVE" | "DISABLED";
  senders: MailSender[];
};

export type SenderTenant = { id: string; name: string };

export type MailConfiguration = {
  tenants: SenderTenant[];
  accounts: GmailAccount[];
};
