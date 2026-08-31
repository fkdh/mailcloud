# Mailcloud Project Plan

## Tujuan

Membangun aplikasi admin untuk mengirim email plain text melalui Gmail SMTP dan alamat bisnis yang telah diverifikasi lewat Gmail Send mail as.

## Stack

- TanStack Start
- TanStack Router
- TypeScript
- PostgreSQL
- Drizzle ORM dan Drizzle Kit
- Tailwind CSS
- shadcn/ui
- Zod
- Nodemailer

## Keputusan Produk

- Aplikasi menggunakan satu project untuk frontend dan API.
- Terdapat dua role: `SUPERADMIN` dan `ADMIN`.
- Satu user hanya dapat berada di satu tenant.
- Satu tenant dapat dikelola oleh banyak admin.
- Superadmin dibuat melalui seed.
- Admin dapat dibuat oleh superadmin atau mendaftar sendiri.
- Admin yang mendaftar sendiri harus menunggu validasi superadmin.
- Email dikirim sebagai plain text terlebih dahulu.
- Setiap tenant dapat memiliki beberapa koneksi Gmail dan alamat `Send mail as`.
- Pengguna memilih alamat sender saat mengirim email.
- Gmail App Password disimpan terenkripsi di server dan tidak pernah dikirim ke client.

## Roadmap

### 1. Fondasi Project

- [x] Migrasikan server Express saat ini ke TanStack Start.
- [x] Atur TanStack Router dengan file-based routing.
- [x] Konfigurasi Tailwind CSS dan shadcn/ui.
- [x] Siapkan layout dashboard dengan sidebar kiri.
- [ ] Pisahkan konfigurasi environment untuk development dan production.

### 2. Database

- [x] Buat koneksi PostgreSQL menggunakan Drizzle.
- [x] Buat schema `users`.
- [x] Buat schema `tenants`.
- [x] Buat schema `sessions`.
- [x] Buat schema `email_logs`.
- [x] Buat schema `gmail_accounts` dan `mail_senders` per tenant.
- [x] Buat migration database.
- [x] Buat seed superadmin yang idempotent.
- [x] Jalankan migration dan seed pada database lokal.

### 3. Auth dan Authorization

- [x] Implementasikan register.
- [x] Implementasikan login dan logout.
- [x] Hash password menggunakan Argon2 atau bcrypt.
- [x] Gunakan session berbasis cookie yang aman.
- [x] Tambahkan middleware auth.
- [x] Tambahkan proteksi role superadmin dan admin.
- [x] Implementasikan status user: `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`.
- [x] Implementasikan approval admin oleh superadmin.

### 4. Multi-Tenant

- [x] Tambahkan `tenantId` pada user admin.
- [x] Pastikan admin hanya dapat mengakses data tenant miliknya.
- [x] Pastikan `tenantId` tidak dapat ditentukan secara bebas dari request client.
- [ ] Buat halaman daftar tenant untuk superadmin.
- [x] Buat halaman daftar user lintas tenant untuk superadmin.
- [ ] Buat halaman daftar admin per tenant.
- [ ] Buat fitur superadmin untuk membuat admin langsung.

### 5. Email

- [x] Pindahkan fungsi Nodemailer ke server-only module dan route TanStack Start.
- [x] Buat form kirim email plain text.
- [x] Gunakan alamat `Send mail as` yang dipilih dari database sebagai alamat pengirim.
- [x] Tambahkan validasi `to`, `subject`, dan `text` menggunakan Zod.
- [x] Simpan riwayat pengiriman ke `email_logs`.
- [x] Tampilkan status berhasil atau gagal pada UI.
- [x] Tambahkan konfigurasi Gmail account dan sender per tenant.

### 6. Dashboard UI

- [x] Buat halaman login.
- [x] Buat halaman register.
- [x] Buat dashboard admin dasar.
- [x] Buat halaman kirim email.
- [x] Buat halaman riwayat email.
- [x] Buat halaman pengaturan email sender.
- [x] Buat halaman approval khusus superadmin.
- [ ] Buat loading state, empty state, dan error state.
- [ ] Pastikan layout responsif untuk mobile.

### 7. Security dan Production

- [ ] Tambahkan validasi environment saat startup.
- [x] Jangan expose password atau App Password pada response/log.
- [ ] Tambahkan CSRF protection jika diperlukan oleh strategi session.
- [ ] Tambahkan security headers.
- [ ] Tambahkan audit log untuk aksi superadmin.
- [ ] Tambahkan forgot password dan verifikasi email.
- [ ] Siapkan deployment PostgreSQL dan TanStack Start.
- [x] Pastikan `.env` tidak pernah di-commit.

## Fitur Setelah MVP

- [ ] Email HTML dan template email.
- [ ] Attachment.
- [ ] Queue pengiriman email.
- [ ] Retry otomatis.
- [ ] OAuth Gmail.
- [ ] Provider email selain Gmail.
- [ ] Dashboard statistik.
- [ ] Billing atau subscription.
- [ ] Dukungan satu user ke banyak tenant jika diperlukan.
