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

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function systemMailConfig() {
  return {
    smtpUser: requiredEnv("MAIL_GMAIL_USER"),
    fromEmail: requiredEnv("MAIL_FROM_EMAIL"),
    appPassword: requiredEnv("MAIL_GMAIL_APP_PASSWORD").replace(/\s/g, ""),
  };
}

async function sendSystemEmail(input: { to: string; subject: string; text: string }) {
  const config = systemMailConfig();

  return sendTextEmail({
    credentials: { smtpUser: config.smtpUser, appPassword: config.appPassword },
    fromEmail: config.fromEmail,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

export function validateSystemMailConfig() {
  systemMailConfig();
}

export function sendPasswordResetEmail(input: { to: string; resetUrl: string }) {
  return sendSystemEmail({
    to: input.to,
    subject: "Reset your Mailcloud password",
    text: [
      "We received a request to reset your Mailcloud password.",
      "",
      `Reset your password using this link: ${input.resetUrl}`,
      "",
      "This link expires in 1 hour and can only be used once.",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
  });
}

export function sendAccountActivationEmail(input: { to: string; activationUrl: string }) {
  return sendSystemEmail({
    to: input.to,
    subject: "Activate your Mailcloud account",
    text: [
      "Your Mailcloud account has been created.",
      "",
      `Activate your account using this link: ${input.activationUrl}`,
      "",
      "This link expires in 24 hours and can only be used once.",
    ].join("\n"),
  });
}
