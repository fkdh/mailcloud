# Mailcloud Progress

## Status Saat Ini

Status: Fondasi TanStack Start, feature modules, database, autentikasi, multi-tenant, multi-sender Gmail, dan dashboard selesai.

## Sudah Selesai

### Email API Dasar

- [x] Membuat project Node.js TypeScript.
- [x] Menambahkan Express.
- [x] Menambahkan Nodemailer.
- [x] Menambahkan dotenv.
- [x] Menggunakan Gmail SMTP.
- [x] Menggunakan beberapa alamat bisnis melalui Gmail Send mail as.
- [x] Membuat endpoint `GET /health`.
- [x] Membuat endpoint `POST /api/send-email`.
- [x] Mengirim email plain text.
- [x] Menggunakan sender yang dipilih dari database sebagai alamat pengirim.
- [x] Menghapus dukungan HTML.
- [x] Menghapus `replyTo`.
- [x] Menambahkan validasi field `to`, `subject`, dan `text`.
- [x] Menambahkan response error dasar.
- [x] Menambahkan penanganan JSON yang tidak valid.

### Project Setup

- [x] Menambahkan `tsconfig.json`.
- [x] Menambahkan script `npm run dev`.
- [x] Menambahkan script `npm run build`.
- [x] Menambahkan script `npm start`.
- [x] Menambahkan `.env.example`.
- [x] Menambahkan `.gitignore` untuk `.env` dan `dist`.
- [x] Menambahkan README dasar.
- [x] Menjalankan `npm install`.
- [x] Menjalankan TypeScript build dengan sukses.
- [x] Menjalankan startup server dengan sukses.
- [x] Menjalankan `npm audit` dengan hasil 0 vulnerabilities.

### TanStack Start Foundation

- [x] Menghapus server Express lama.
- [x] Menambahkan TanStack Start.
- [x] Menambahkan TanStack Router file-based routing.
- [x] Menambahkan Vite dan Nitro configuration.
- [x] Membuat route dashboard `/dashboard`.
- [x] Membuat route `GET /health`.
- [x] Memindahkan `POST /api/send-email` ke server route TanStack Start.
- [x] Memisahkan Nodemailer ke `server/services/mailer.ts`.
- [x] Membuat layout dashboard dengan sidebar kiri.
- [x] Membuat halaman compose email plain text.
- [x] Menambahkan responsive styling dasar.

### Database Foundation

- [x] Menambahkan PostgreSQL client.
- [x] Menambahkan Drizzle ORM dan Drizzle Kit.
- [x] Membuat schema `users`.
- [x] Membuat schema `tenants`.
- [x] Membuat schema `email_logs`.
- [x] Membuat schema `gmail_accounts` dan `mail_senders` per tenant.
- [x] Membuat migration `drizzle/0000_low_liz_osborn.sql`.
- [x] Membuat migration `drizzle/0001_sparkling_titanium_man.sql`.
- [x] Membuat migration `drizzle/0002_naive_black_bolt.sql` untuk Gmail accounts dan senders.
- [x] Membuat seed superadmin idempotent.
- [x] Menambahkan script `db:generate`.
- [x] Menambahkan script `db:migrate`.
- [x] Menambahkan script `db:seed`.
- [x] Menambahkan konfigurasi database dan seed ke `.env.example`.

### Authentication Foundation

- [x] Menambahkan schema `sessions`.
- [x] Menambahkan validasi login, register, dan approval dengan Zod.
- [x] Menambahkan password hashing dengan Argon2.
- [x] Menambahkan session cookie HttpOnly.
- [x] Membuat endpoint `POST /api/register`.
- [x] Membuat endpoint `POST /api/login`.
- [x] Membuat endpoint `POST /api/logout`.
- [x] Membuat endpoint current user `/api/me`.
- [x] Membuat endpoint approval superadmin di `/api/admin/approvals`.
- [x] Membatasi endpoint kirim email dengan session.
- [x] Membuat UI login dan register dasar.
- [x] Menambahkan logout pada dashboard.
- [x] Membuat UI approval admin untuk superadmin.
- [x] Membuat UI daftar seluruh user lintas tenant untuk superadmin.

### Email and UI Improvements

- [x] Menyimpan log email sukses per tenant.
- [x] Menyimpan log email gagal per tenant.
- [x] Membuat endpoint `GET /api/email-logs`.
- [x] Membuat halaman riwayat email.
- [x] Membatasi riwayat email berdasarkan `tenantId` admin dan menampilkan seluruh tenant untuk superadmin.
- [x] Menambahkan setup Gmail account per tenant.
- [x] Menambahkan beberapa alamat `Send mail as` per Gmail account.
- [x] Mengenkripsi Gmail App Password sebelum disimpan ke database.
- [x] Menambahkan pilihan sender pada form kirim email.
- [x] Menambahkan verifikasi koneksi Gmail sebelum menyimpan account.
- [x] Menghapus penggunaan `SMTP_USER`, `SMTP_PASS`, dan `FROM_EMAIL` dari mailer.
- [x] Menambahkan Tailwind CSS.
- [x] Menambahkan konfigurasi dasar shadcn/ui.
- [x] Menambahkan komponen dasar shadcn `Button`.
- [x] Memisahkan handler API ke `src/server/services`.
- [x] Memisahkan route API ke endpoint `/api/*`.
- [x] Mengganti styling global custom dengan theme Tailwind/shadcn.
- [x] Membuat komponen reusable `AuthCard`, `PageHeader`, `EmptyState`, `StatCard`, dan `DashboardShell`.
- [x] Membuat feature modules auth, email, dan users beserta services, hooks, types, validation, dan components.
- [x] Memindahkan database ke `src/server/database` dan konfigurasi Drizzle ke lokasi schema baru.
- [x] Membuat komponen reusable `Card`, `Input`, `Textarea`, `Label`, `FormField`, `Badge`, dan `Table`.
- [x] Menambahkan `@tanstack/react-form` untuk seluruh form input.
- [x] Menambahkan validasi per field menggunakan schema Zod.
- [x] Menambahkan pesan error field dan styling invalid berwarna merah.
- [x] Menambahkan validasi `confirmPassword` pada register.

## Belum Dikerjakan

- [x] Tailwind CSS dan konfigurasi shadcn/ui.
- [x] Penyempurnaan UI dashboard dengan komponen shadcn/ui.
- [x] Menjalankan migration pada PostgreSQL lokal.
- [ ] Penyempurnaan session dan autentikasi.
- [x] Seed superadmin.
- [x] Register admin.
- [x] Approval admin oleh superadmin.
- [x] Authorization berbasis role.
- [x] Tenant isolation dasar pada endpoint yang tersedia.
- [x] Superadmin dapat melihat user, sender, dan email log lintas tenant.
- [ ] Rate limit pengiriman email.

## Verifikasi Terakhir

Perintah yang berhasil dijalankan:

```bash
npm install
npm run build
npm start
npm audit --omit=dev
npm run db:migrate
npm run db:seed
curl http://localhost:3000/health
curl http://localhost:3000/login
curl http://localhost:3000/dashboard
curl http://localhost:3000/api/me
```

## Catatan

- File `.env` tersedia secara lokal dan sudah di-ignore oleh Git.
- Jangan commit `.env` karena dapat berisi Gmail App Password.
- Pengiriman email nyata belum diuji dalam sesi ini karena kredensial dan alamat tujuan tidak digunakan.
- Endpoint yang membutuhkan session mengembalikan `401` tanpa login, sesuai expected behavior.
