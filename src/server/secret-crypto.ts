import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

function encryptionKey() {
  const value = process.env.SENDER_ENCRYPTION_KEY;
  if (!value) throw new Error("SENDER_ENCRYPTION_KEY is required");

  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("SENDER_ENCRYPTION_KEY must be a base64 encoded 32-byte key");
  return key;
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return {
    value: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(value: string, iv: string, tag: string) {
  const decipher = createDecipheriv(algorithm, encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(value, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
