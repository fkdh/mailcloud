import "dotenv/config";
import nodemailer from "nodemailer";

type GmailCredentials = {
  smtpUser: string;
  appPassword?: string;
  accessToken?: string;
  refreshToken?: string;
};

function createTransporter(credentials: GmailCredentials) {
  const auth = credentials.accessToken && credentials.refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        type: "OAuth2" as const,
        user: credentials.smtpUser,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
      }
    : { user: credentials.smtpUser, pass: credentials.appPassword };

  const options = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth,
  } as import("nodemailer/lib/smtp-transport").Options;

  return nodemailer.createTransport(options);
}

export async function verifyGmailAccount(credentials: GmailCredentials) {
  await createTransporter(credentials).verify();
}

export async function sendTextEmail(input: {
  credentials: GmailCredentials;
  fromEmail: string;
  to: string;
  subject: string;
  text: string;
}) {
  return createTransporter(input.credentials).sendMail({
    from: input.fromEmail,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}
