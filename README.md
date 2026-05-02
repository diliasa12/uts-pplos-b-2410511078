# UTS PPLOS B - Sistem Booking Lapangan Olahraga

## Identitas

|                 |                                                  |
| --------------- | ------------------------------------------------ |
| **Nama**        | MUHAMMAD ASSYA DILI                              |
| **NIM**         | 2410511078                                       |
| **Kelas**       | B                                                |
| **Mata Kuliah** | Pembangunan Perangkat Lunak Berorientasi Service |
| **Dosen**       | Muhammad Panji Muslim, S.Pd., M.Kom              |
| **Demo Video**  | [Link YouTube]                                   |

---

## Arsitektur

```
Client / Postman
      ↓
API Gateway (port 3000)
      ↓
┌─────────────────────────────────────────┐
│  Auth Service    │  port 3001  │ Express │
│  Field Service   │  port 3002  │ Laravel │
│  Booking Service │  port 3003  │ Express │
└─────────────────────────────────────────┘
```

---

## Cara Menjalankan

### Prerequisites

- Node.js v18+
- PHP 8.2+
- Composer
- MySQL

### 1. Clone Repository

```bash
git clone https://github.com/<username>/uts-pplos-b-2410511078.git
cd uts-pplos-b-2410511078
```

### 2. Setup Environment

Copy `.env.example` ke `.env` di setiap folder:

```bash
cp gateway/.env.example gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/field-service/.env.example services/field-service/.env
cp services/booking-service/.env.example services/booking-service/.env
```

Isi nilai berikut di setiap `.env`:

```env
# Wajib sama di semua service
JWT_SECRET=your_jwt_secret
GATEWAY_SECRET=your_gateway_secret

# Google OAuth (auth-service)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/oauth/google/callback
```

### 3. Auth Service

```bash
cd services/auth-service
npm install
npm run migrate
npm run dev
```

### 4. Field Service

```bash
cd services/field-service
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=3002
```

### 5. Booking Service

```bash
cd services/booking-service
npm install
npm run migrate
npm run dev
```

### 6. API Gateway

```bash
cd gateway
npm install
npm run dev
```

### Semua service berjalan

| Service         | Port | Status                          |
| --------------- | ---- | ------------------------------- |
| API Gateway     | 3000 | `npm run dev`                   |
| Auth Service    | 3001 | `npm run dev`                   |
| Field Service   | 3002 | `php artisan serve --port=3002` |
| Booking Service | 3003 | `npm run dev`                   |

---

## Peta Endpoint

> Semua request wajib melalui Gateway: `http://localhost:3000`

### Auth Service → `/service1/*`

#### Public (tanpa token)

| Method | Endpoint                               | Deskripsi                 |
| ------ | -------------------------------------- | ------------------------- |
| POST   | `/service1/auth/register`              | Register user baru        |
| POST   | `/service1/auth/login`                 | Login, mendapat JWT token |
| POST   | `/service1/auth/refresh`               | Refresh access token      |
| GET    | `/service1/auth/oauth/google`          | Redirect ke Google OAuth  |
| GET    | `/service1/auth/oauth/google/callback` | Callback Google OAuth     |

#### Protected (butuh token)

| Method | Endpoint                | Role        | Deskripsi               |
| ------ | ----------------------- | ----------- | ----------------------- |
| GET    | `/service1/auth/me`     | user, admin | Lihat profil sendiri    |
| POST   | `/service1/auth/logout` | user, admin | Logout, blacklist token |

---

### Field Service → `/service2/*`

#### Public (tanpa token)

| Method | Endpoint                     | Deskripsi                               |
| ------ | ---------------------------- | --------------------------------------- |
| GET    | `/service2/categories`       | List semua kategori                     |
| GET    | `/service2/categories/:id`   | Detail kategori                         |
| GET    | `/service2/fields`           | List lapangan (support paging & filter) |
| GET    | `/service2/fields/:id`       | Detail lapangan                         |
| GET    | `/service2/fields/:id/slots` | List slot lapangan                      |

#### Query params untuk listing

```
GET /service2/fields?page=1&per_page=10&status=active&min_price=50000&max_price=200000&search=futsal&location=jakarta
GET /service2/fields/:id/slots?date=2026-05-10&status=available&per_page=10
```

#### Protected — Admin Only

| Method | Endpoint                      | Deskripsi                              |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | `/service2/categories`        | Buat kategori baru                     |
| PUT    | `/service2/categories/:id`    | Update kategori                        |
| DELETE | `/service2/categories/:id`    | Hapus kategori                         |
| POST   | `/service2/fields`            | Buat lapangan baru                     |
| PUT    | `/service2/fields/:id`        | Update lapangan                        |
| DELETE | `/service2/fields/:id`        | Hapus lapangan                         |
| POST   | `/service2/fields/:id/slots`  | Buat slot waktu                        |
| PATCH  | `/service2/slots/:id/lock`    | Kunci slot (dipanggil booking-service) |
| PATCH  | `/service2/slots/:id/release` | Lepas slot                             |

---

### Booking Service → `/service3/*`

#### Protected — User & Admin

| Method | Endpoint                          | Role        | Deskripsi                  |
| ------ | --------------------------------- | ----------- | -------------------------- |
| GET    | `/service3/bookings`              | user, admin | List booking milik sendiri |
| POST   | `/service3/bookings`              | user, admin | Buat booking baru          |
| GET    | `/service3/bookings/:id`          | user, admin | Detail booking             |
| POST   | `/service3/bookings/:id/cancel`   | user, admin | Batalkan booking           |
| GET    | `/service3/bookings/:id/payments` | user, admin | List pembayaran            |
| POST   | `/service3/bookings/:id/payments` | user, admin | Bayar DP atau lunas        |

#### Protected — Admin Only

| Method | Endpoint                       | Deskripsi                            |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/service3/bookings/dashboard` | Dashboard statistik pemilik lapangan |

---

## Postman Collection

Import file `postman/collection.json` ke Postman.

Urutan test yang disarankan:

```
1. Register Admin
2. Login Admin       → token tersimpan otomatis
3. Create Category
4. Create Field
5. Create Slot
6. Login User        → token tersimpan otomatis
7. Create Booking
8. Pay DP
9. Pay Full
10. Dashboard        → login admin dulu
```
