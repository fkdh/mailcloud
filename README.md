# Mailcloud

Mailcloud adalah dashboard email multi-tenant untuk mengirim email plain text melalui Gmail SMTP. Setiap workspace dapat memiliki beberapa Gmail account dan alamat bisnis yang sudah diverifikasi melalui fitur Gmail **Send mail as**.

## Fitur

- Login, register, logout, dan session berbasis cookie HttpOnly.
- Reset password melalui link satu kali yang dikirim lewat email.
- Aktivasi akun baru melalui link satu kali yang dikirim lewat email.
- Dua role: `SUPERADMIN` dan `ADMIN`.
- Approval admin baru oleh superadmin.
- Isolasi data berdasarkan tenant/workspace.
- Konfigurasi Gmail menggunakan App Password atau Google OAuth.
- Beberapa alamat sender per Gmail account.
- Pengiriman email plain text melalui Nodemailer.
- Public API dengan Personal Access Token untuk pengiriman email dari aplikasi eksternal.
- Validasi input menggunakan Zod.
- Riwayat email sukses dan gagal per tenant.
- Dashboard analytics: jumlah email terkirim, gagal, delivery rate, dan active senders.
- Manajemen user dan status user untuk superadmin.
- UI responsive dengan light/dark theme.

## Tech Stack

- TypeScript
- React 19
- TanStack Start dan TanStack Router
- PostgreSQL
- Drizzle ORM dan Drizzle Kit
- Tailwind CSS
- shadcn/ui primitives
- Zod
- Nodemailer
- Argon2

## Persyaratan

- Node.js 20 atau lebih baru
- PostgreSQL
- Google Cloud project jika ingin memakai Gmail OAuth

## Instalasi

```bash
npm install
cp .env.example .env
```

Buat database PostgreSQL, lalu isi variabel environment pada `.env`.

### Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mailcloud
APP_URL=http://localhost:3000
SENDER_ENCRYPTION_KEY=base64-encoded-random-32-byte-key

# Gmail SMTP account for system emails such as password reset and activation.
MAIL_GMAIL_USER=system-mailer@gmail.com
MAIL_FROM_EMAIL=system-mailer@gmail.com
MAIL_GMAIL_APP_PASSWORD=your-gmail-app-password

# Optional, diperlukan untuk Gmail OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/oauth/callback

SUPERADMIN_NAME=System Administrator
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=change-this-password
```

Generate key enkripsi dengan:

```bash
openssl rand -base64 32
```

`SENDER_ENCRYPTION_KEY` dipakai untuk mengenkripsi credential Gmail di database. Jangan mengganti key setelah credential tersimpan kecuali melakukan key rotation secara terencana.

Password reset dan aktivasi akun memakai akun Gmail SMTP khusus dari `MAIL_GMAIL_USER` dengan App Password. `MAIL_FROM_EMAIL` dapat menggunakan alamat Gmail yang sama atau alamat yang sudah dikonfigurasi sebagai **Send mail as**. `APP_URL` harus berisi URL publik aplikasi agar link mengarah ke deployment yang benar.

## Database

Migration yang sudah ada di folder `drizzle/` dapat dijalankan dengan:

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` membuat atau memperbarui superadmin berdasarkan `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, dan `SUPERADMIN_PASSWORD`. Seed bersifat idempotent.

Jika schema berubah, buat migration baru terlebih dahulu:

```bash
npm run db:generate
npm run db:migrate
```

## Gmail Setup

### App Password

1. Aktifkan 2-Step Verification pada akun Gmail.
2. Buat App Password dari pengaturan Google Account.
3. Jalankan aplikasi dan buka `Gmail settings` pada dashboard.
4. Tambahkan Gmail account menggunakan App Password.
5. Tambahkan alamat bisnis yang sudah diverifikasi melalui Gmail **Send mail as**.

App Password disimpan terenkripsi di server dan tidak dikirim kembali ke client.

### Google OAuth

1. Buat OAuth Client ID tipe **Web application** di Google Cloud.
2. Aktifkan Gmail API pada project tersebut.
3. Tambahkan redirect URI berikut pada OAuth client:

   ```text
   http://localhost:3000/api/gmail/oauth/callback
   ```

4. Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan `GOOGLE_REDIRECT_URI` pada `.env`.
5. Hubungkan akun Gmail dari halaman `Gmail settings`.

Mailcloud meminta scope `https://mail.google.com/` agar dapat mengirim email melalui Gmail SMTP. OAuth state disimpan one-time dan credential token disimpan terenkripsi di server.

## Menjalankan

Development server:

```bash
npm run dev
```

Buka `http://localhost:3000`. Route `/` mengarahkan ke `/dashboard`.

Production build:

```bash
npm run build
npm start
```

Health check tersedia pada `http://localhost:3000/health`.

## NPM Scripts

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build client/server dan cek TypeScript |
| `npm start` | Menjalankan hasil production build |
| `npm run db:generate` | Membuat migration dari perubahan schema |
| `npm run db:migrate` | Menjalankan migration PostgreSQL |
| `npm run db:seed` | Membuat atau memperbarui superadmin |

## Halaman Utama

- `/login` - login user.
- `/forgot-password` - meminta link reset password.
- `/reset-password` - mengatur password baru dari link reset.
- `/register` - registrasi workspace/admin.
- `/dashboard` - overview dan analytics.
- `/dashboard/send-email` - compose dan kirim email.
- `/dashboard/email-logs` - riwayat pengiriman email.
- `/dashboard/senders` - Gmail account dan sender management.
- `/dashboard/approvals` - approval admin baru, khusus superadmin.
- `/dashboard/users` - daftar user lintas tenant, khusus superadmin.
- `/dashboard/profile` - profil user aktif.
- `/dashboard/api-access` - membuat token dan dokumentasi API pengiriman email.

## API Routes

### Public

| Method | Route | Keterangan |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/register` | Registrasi admin/workspace |
| `POST` | `/api/login` | Login |
| `POST` | `/api/forgot-password` | Mengirim link reset password |
| `POST` | `/api/reset-password` | Mengubah password dengan token reset |
| `GET` | `/api/activate?token=...` | Aktivasi akun dan redirect ke login |
| `GET` | `/api/gmail/oauth/callback` | Callback Google OAuth |

### Authenticated

| Method | Route | Keterangan |
| --- | --- | --- |
| `POST` | `/api/logout` | Logout dari session aktif |
| `GET` | `/api/me` | User dan tenant aktif |
| `GET` | `/api/dashboard-analytics` | Analytics tenant |
| `POST` | `/api/send-email` | Mengirim email plain text |
| `GET` | `/api/email-logs` | Daftar log email |
| `GET` | `/api/mail-senders` | Konfigurasi Gmail dan sender |
| `GET` | `/api/api-tokens` | Daftar API token milik user aktif |
| `POST` | `/api/api-tokens` | Membuat API token baru |
| `DELETE` | `/api/api-tokens/:id` | Menghapus API token |
| `POST` | `/api/gmail-accounts` | Menambahkan Gmail account App Password |
| `DELETE` | `/api/gmail-accounts/:id` | Menghapus Gmail account |
| `POST` | `/api/mail-senders` | Menambahkan alamat sender |
| `PATCH` | `/api/mail-senders/:id` | Memperbarui sender |
| `DELETE` | `/api/mail-senders/:id` | Menghapus sender |
| `GET` | `/api/gmail/oauth/start` | Memulai Google OAuth |

### Public API

Public API membutuhkan Personal Access Token dengan scope `emails:send`. Token dibuat dari halaman `/dashboard/api-access` dan hanya ditampilkan sekali setelah dibuat.

| Method | Route | Keterangan |
| --- | --- | --- |
| `POST` | `/api/v1/emails/send` | Mengirim email melalui sender default atau `senderId` yang dipilih |

### Superadmin

| Method | Route | Keterangan |
| --- | --- | --- |
| `GET` | `/api/admin/approvals` | Daftar admin pending |
| `POST` | `/api/admin/approvals` | Approve atau reject admin |
| `GET` | `/api/admin/users` | Daftar seluruh user |
| `PATCH` | `/api/admin/users/:id` | Memperbarui status user |
| `DELETE` | `/api/admin/users/:id` | Menghapus user |

## Contoh Request

Request pengiriman email membutuhkan session cookie dan `senderId` yang valid untuk tenant aktif.

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -H "Cookie: mailcloud_session=your-session-cookie" \
  -d '{
    "senderId": "sender-uuid",
    "to": "customer@example.com",
    "subject": "Pesan percobaan",
    "text": "Halo dari Mailcloud."
  }'
```

Public API menggunakan header `Authorization: Bearer` dan tidak membutuhkan session cookie. Jika `senderId` dihilangkan, Mailcloud menggunakan sender default yang aktif pada workspace.

```bash
curl -X POST https://your-mailcloud-domain.com/api/v1/emails/send \
  -H "Authorization: Bearer mc_live_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "sender-uuid-from-gmail-settings",
    "to": "customer@example.com",
    "subject": "Hello from Mailcloud",
    "text": "This email was sent through the Mailcloud API."
  }'
```

Body yang tersedia:

- `to` wajib berupa alamat email penerima.
- `subject` wajib diisi dan maksimal 255 karakter.
- `text` wajib diisi dan maksimal 100.000 karakter.
- `senderId` opsional berupa UUID sender aktif. ID tersebut dapat disalin dari halaman `/dashboard/api-access`. Jika tidak dikirim, sender default digunakan.

## Struktur Proyek

```text
src/
  components/       Komponen UI reusable dan layout
  features/         Modul auth, email, users, dan dashboard
  routes/           File-based routes UI dan API
  server/           Auth, database, service, mailer, dan crypto
  styles/           Theme dan global CSS
drizzle/            PostgreSQL migrations
```

## Keamanan

- File `.env` di-ignore Git dan tidak boleh di-commit.
- Password user di-hash menggunakan Argon2.
- Session disimpan sebagai hash token di database.
- Credential Gmail dienkripsi menggunakan AES-256-GCM.
- `tenantId` ditentukan dari session server, bukan dari request client.
- App Password dan token OAuth tidak dikembalikan ke client.
- OAuth memakai state one-time untuk perlindungan CSRF.
- API token disimpan sebagai hash SHA-256, hanya token mentah saat pembuatan yang ditampilkan.
- API token dapat dihapus dari halaman API Access & Integrations.
- Endpoint API pengiriman email dibatasi 30 request per menit per token.

## Status dan Batasan

Mailcloud saat ini berfokus pada MVP pengiriman email plain text. Fitur yang belum tersedia antara lain email HTML/template, attachment, queue pengiriman, retry otomatis, forgot password, dan deployment automation.

## Lisensi

Belum ditentukan.
