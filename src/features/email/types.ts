export type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  fromEmail: string | null;
  tenantName?: string;
  status: "SENT" | "FAILED";
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type SendEmailInput = {
  senderId: string;
  to: string;
  subject: string;
  text: string;
};
