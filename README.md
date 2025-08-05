# Deskripsi Proyek

Proyek ini adalah sebuah aplikasi backend berbasis Node.js yang menyediakan API untuk manajemen film, artis, dan genre. Aplikasi ini menggunakan Express sebagai framework web, Sequelize sebagai ORM untuk berinteraksi dengan database, serta JWT untuk autentikasi dan otorisasi berbasis peran (admin dan viewer). Fitur unggulan termasuk upload video dan thumbnail film, pencarian film, serta pengelolaan data artis dan genre dengan hak akses yang berbeda.

# Tech Stack yang Digunakan

- Node.js
- Express
- Sequelize (ORM)
- JWT (JSON Web Token) untuk autentikasi
- bcrypt untuk hashing password
- multer untuk upload file (video dan thumbnail)
- cors untuk mengatur kebijakan akses lintas domain
- dotenv untuk konfigurasi variabel lingkungan

# Fitur-Fitur

- Registrasi dan login pengguna dengan peran admin atau viewer
- Autentikasi menggunakan JWT dengan masa berlaku token 8 jam
- Manajemen film (create, update, search, detail, akses video dan thumbnail) dengan upload file
- Manajemen artis (create, list, update, delete)
- Manajemen genre (create, list, update, delete)
- Akses API berbasis peran: admin memiliki akses penuh, viewer hanya dapat melihat data

# Dokumentasi API Endpoint

## Autentikasi

### Register

- **URL:** `/api/auth/register`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password",
    "role": "admin atau viewer"
  }
  ```
- **Response:**
  - 201 Created
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "admin"
    }
  }
  ```
- **Catatan:** Role harus "admin" atau "viewer".

### Login

- **URL:** `/api/auth/login`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response:**
  - 200 OK
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "admin"
    }
  }
  ```

### Logout

- **URL:** `/api/auth/logout`
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

## Film

### Create Film (Admin Only)

- **URL:** `/api/films`
- **Method:** POST
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body:** Form data dengan field:
  - `video` (file video)
  - `thumbnail` (file gambar thumbnail)
  - Field lain sesuai validasi film
- **Response:**
  - 201 Created
  ```json
  {
    "message": "Film created successfully",
    "film": { ... }
  }
  ```

### Update Film (Admin Only)

- **URL:** `/api/films/:id`
- **Method:** PUT
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body:** Form data dengan field:
  - `video` (file video, opsional)
  - `thumbnail` (file gambar thumbnail, opsional)
  - Field lain sesuai validasi film
- **Response:**
  - 200 OK
  ```json
  {
    "message": "Film updated successfully",
    "film": { ... }
  }
  ```

### Search Films (Admin and Viewer)

- **URL:** `/api/films/search`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK
  ```json
  [
    { "id": 1, "title": "Film 1", ... },
    { "id": 2, "title": "Film 2", ... }
  ]
  ```

### Get Film Video URL (Admin and Viewer)

- **URL:** `/api/films/:id/video`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK
  ```json
  {
    "videoUrl": "url_to_video"
  }
  ```

### Get Film Thumbnail URL (Admin and Viewer)

- **URL:** `/api/films/:id/thumbnail`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK
  ```json
  {
    "thumbnailUrl": "url_to_thumbnail"
  }
  ```

### Get Film Details (Admin and Viewer)

- **URL:** `/api/films/:id`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK
  ```json
  {
    "id": 1,
    "title": "Film Title",
    "description": "Film description",
    ...
  }
  ```

## Artist

### Create Artist (Admin Only)

- **URL:** `/api/artists`
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`
- **Body:** JSON dengan data artis
- **Response:**
  - 201 Created

### List Artists (Admin and Viewer)

- **URL:** `/api/artists`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK

### Update Artist (Admin Only)

- **URL:** `/api/artists/:id`
- **Method:** PUT
- **Headers:** `Authorization: Bearer <token>`
- **Body:** JSON dengan data artis
- **Response:**
  - 200 OK

### Delete Artist (Admin Only)

- **URL:** `/api/artists/:id`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK

## Genre

### Create Genre (Admin Only)

- **URL:** `/api/genres`
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`
- **Body:** JSON dengan data genre
- **Response:**
  - 201 Created

### List Genres (Admin and Viewer)

- **URL:** `/api/genres`
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK

### Update Genre (Admin Only)

- **URL:** `/api/genres/:id`
- **Method:** PUT
- **Headers:** `Authorization: Bearer <token>`
- **Body:** JSON dengan data genre
- **Response:**
  - 200 OK

### Delete Genre (Admin Only)

- **URL:** `/api/genres/:id`
- **Method:** DELETE
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  - 200 OK

# Konfigurasi Proyek dan Cara Menjalankan Secara Lokal

1. Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi variabel lingkungan seperti `PORT`, `DATABASE_URL`, dan `JWT_SECRET`.
2. Masuk ke folder backend lalu frontend
3. Install dependencies dengan perintah:
   ```
   npm install
   ```
4. Jalankan migrasi dan sinkronisasi database (jika ada).
5. Jalankan server dengan perintah:
   ```
   npm start
   ```
6. Server akan berjalan di port yang telah dikonfigurasi (default 3001).
7. Gunakan aplikasi klien atau tools seperti Postman untuk mengakses API dengan endpoint yang telah didokumentasikan.


# Akun default untuk login
1. Akun admin: 
    - Email: admin@gmail.com
    - Password: 12345678
2. Akun viewer: 
    - Email: viewer@gmail.com
    - Password: 12345678
---


