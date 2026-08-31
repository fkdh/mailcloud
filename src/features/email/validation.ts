import { z } from "zod";

export const recipientSchema = z.string().trim().email("Masukkan email penerima yang valid");
export const subjectSchema = z.string().trim().min(1, "Subject wajib diisi").max(255, "Subject terlalu panjang");
export const messageSchema = z.string().trim().min(1, "Message wajib diisi").max(100000, "Message terlalu panjang");

export const sendEmailSchema = z.object({
  senderId: z.string().uuid("Pilih email sender terlebih dahulu"),
  to: recipientSchema,
  subject: subjectSchema,
  text: messageSchema,
});

export const apiSendEmailSchema = z.object({
  senderId: z.string().uuid("senderId tidak valid").optional(),
  to: recipientSchema,
  subject: subjectSchema,
  text: messageSchema,
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type ApiSendEmailInput = z.infer<typeof apiSendEmailSchema>;
