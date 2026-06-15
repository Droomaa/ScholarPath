# Dokumentasi Struktur & Fungsi Backend ScholarPath

Dokumen ini menjelaskan seluruh struktur file dan fungsionalitas komponen backend pada proyek **ScholarPath**. Backend ScholarPath terbagi menjadi dua bagian utama:
1. **Go Backend (Golang + Gin + GORM + PostgreSQL)** sebagai backend utama untuk transaksi data, autentikasi, dan CRUD.
2. **Python AI Engine (FastAPI + SentenceTransformers + BM25 + Gemini API)** sebagai microservice kecerdasan buatan untuk sistem rekomendasi beasiswa/olimpiade secara hybrid.

---

## 1. Go Backend (`scholarpath-backend`)

Terletak pada direktori `scholarpath-backend/`. Backend ini mengurus logika utama bisnis, penyimpanan data ke database PostgreSQL, autentikasi token, dan komunikasi dengan frontend.

### A. File Utama & Konfigurasi
*   **`main.go`**
    *   **Fungsi**: Titik masuk utama (*entry point*) aplikasi Go. Bertugas memuat konfigurasi dari file `.env`, menghubungkan koneksi ke database PostgreSQL, menginisialisasi router Gin, dan menjalankan server di port `:8080`.
*   **`.env`**
    *   **Fungsi**: Menyimpan variabel lingkungan (*environment variables*) seperti kredensial database PostgreSQL dan kunci rahasia JWT (`JWT_SECRET`).

### B. Modul & Folder Sistem

#### `/koneksi`
*   **`koneksi.go`**
    *   **Fungsi**: Mengelola koneksi ke PostgreSQL menggunakan GORM. Di sini juga terdapat mekanisme *Auto-Migration* untuk menyinkronkan skema tabel database berdasarkan struktur model Go, serta injeksi kolom opsional pada tabel `users` (seperti `role`, `keahlian`, dan `jenjang_id`) agar tetap selaras dengan sistem bawaan Laravel.

#### `/models`
*   **`model.go`**
    *   **Fungsi**: Mendefinisikan struktur skema database (*ORM Models*) menggunakan GORM untuk tabel-tabel berikut:
        *   `User`: Data pengguna (siswa/admin/instansi).
        *   `Instansi`: Detail informasi profil instansi (alamat, kontak, status verifikasi).
        *   `JenjangPendidikan`: Master data tingkatan sekolah/kuliah (SD, SMP, SMA, S1, S2, S3).
        *   `Kategori`: Master data kategori program (Sains, Teknologi, Bahasa, dll).
        *   `Olimpiade`: Informasi lomba/olimpiade yang didaftarkan oleh instansi.
        *   `Beasiswa`: Informasi program beasiswa yang didaftarkan oleh instansi.
        *   `Pendaftaran`: Data transaksi lamaran siswa terhadap beasiswa atau olimpiade.
        *   `Notification`: Log notifikasi sistem untuk pengguna.
        *   `Wishlist`: Daftar program favorit siswa.

#### `/routes`
*   **`route.go`**
    *   **Fungsi**: Mendeklarasikan seluruh rute/endpoint API menggunakan Gin Engine. Terbagi menjadi:
        *   **Rute Publik**: `/login`, `/login-google`, `/register/siswa`, `/register/instansi`, `/api/upload`.
        *   **Rute Terproteksi (JWT)**: Rute profil pengguna, CRUD Beasiswa, CRUD Olimpiade, pendaftaran/aplikasi siswa, pendaftaran dari sisi instansi, manajemen wishlist, rute verifikasi khusus admin, serta integrasi rekomendasi AI.

#### `/middleware`
*   **`authMiddleware.go`**
    *   **Fungsi**: Middleware autentikasi yang memeriksa keberadaan dan validitas token JWT pada header `Authorization: Bearer <token>`.
*   **`cors.go`**
    *   **Fungsi**: Mengaktifkan kebijakan CORS (*Cross-Origin Resource Sharing*) agar API backend dapat diakses dengan aman oleh Laravel/Vite frontend.

#### `/controllers`
Folder ini berisi logika bisnis utama dari seluruh modul aplikasi (*Handler Functions*):
*   **`ctrl_auth.go`**
    *   **Fungsi**: Menangani pendaftaran (*registration*) siswa, instansi, admin, proses masuk (*login*) dengan email/password, serta integrasi login pihak ketiga dengan Google Auth.
*   **`ctrl_user.go`**
    *   **Fungsi**: Membaca (*get*) dan memperbarui (*update*) detail profil siswa, termasuk data minat & keahlian yang disimpan dalam format string dipisahkan koma.
*   **`ctrl_beasiswa.go`**
    *   **Fungsi**: Melayani operasi CRUD (Create, Read, Update, Delete) data program beasiswa.
*   **`ctrl_olimpiade.go`**
    *   **Fungsi**: Melayani operasi CRUD (Create, Read, Update, Delete) data program olimpiade.
*   **`ctrl_pendaftaran.go`**
    *   **Fungsi**: Mengelola proses pendaftaran siswa ke suatu program, mengambil riwayat lamaran siswa, menyajikan daftar pelamar untuk instansi pembuat program, serta memperbarui status aplikasi pelamar (seperti diterima/ditolak).
*   **`ctrl_admin.go`**
    *   **Fungsi**: Berisi fungsi admin untuk verifikasi instansi, verifikasi kualitas beasiswa/olimpiade baru, mengambil statistik dashboard admin, serta menampilkan antrean verifikasi data.
*   **`ctrl_instansi.go`**
    *   **Fungsi**: Menangani data profil khusus instansi/lembaga penyelenggara program.
*   **`ctrl_jenjang.go`**
    *   **Fungsi**: CRUD data master jenjang pendidikan.
*   **`ctrl_kategori.go`**
    *   **Fungsi**: CRUD data master kategori bidang prestasi.
*   **`ctrl_ai.go`**
    *   **Fungsi**: Menghubungkan Go backend ke Python AI service melalui HTTP Request untuk mendapatkan pencocokan beasiswa berdasarkan minat siswa.
*   **`ctrl_wishlist.go`**
    *   **Fungsi**: Menambahkan, membaca, dan menghapus program beasiswa/olimpiade dari wishlist siswa.
*   **`ctrl_upload.go`**
    *   **Fungsi**: Memvalidasi dan menyimpan file gambar profil/dokumen instansi ke media penyimpanan lokal backend.

#### `/utils`
*   **`JwtHelper.go`**
    *   **Fungsi**: Menyediakan utility untuk membuat (*generate*) token JWT baru yang berlaku selama 24 jam serta melakukan validasi (*parse*) token.
*   **`HashHelper.go`**
    *   **Fungsi**: Menyediakan enkripsi password dengan metode **Bcrypt** sebelum disimpan ke database, serta verifikasi kecocokan password login.

---

## 2. Python AI Engine (`scholarpath-ai`)

Terletak pada direktori `scholarpath-ai/`. Layanan ini bertindak sebagai microservice khusus pemrosesan data berbasis kecerdasan buatan (NLP).

### A. File Utama & Konfigurasi
*   **`main.py`**
    *   **Fungsi**: Titik masuk FastAPI microservice yang berjalan pada port `:8001`. Menyediakan endpoint POST `/api/match` yang melayani:
        *   **Skenario A (Single Score)**: Menghitung persentase kecocokan langsung antara satu keahlian siswa dengan satu persyaratan beasiswa/olimpiade.
        *   **Skenario B (Top-K Search)**: Merekomendasikan sejumlah `K` program terbaik berdasarkan kemiripan keahlian siswa dari dataset CSV.
*   **`ai_matcher_fix.py`**
    *   **Fungsi**: *Core NLP engine* kelas `ScholarPathMatcher`. Mengintegrasikan:
        1.  **Google Gemini AI**: Memperluas input keahlian siswa secara dinamis (HyDE/RAG) agar pencarian kata kunci menjadi lebih kaya.
        2.  **Sentence-Transformers (`paraphrase-multilingual-mpnet-base-v2`)**: Menghitung skor kesamaan makna kalimat (*Semantic Cosine Similarity*).
        3.  **BM25 (Okapi BM25)**: Melakukan pencarian kata kunci tradisional (*lexical search*) agar kata kunci presisi tetap terdeteksi.
        4.  **Local Fallback Dictionary**: Kamus lokal bawaan sebagai cadangan (*fail-safe*) jika Gemini API mengalami limitasi kuota (Error 429) sehingga sistem tetap berjalan lancar.
*   **`new_sample_dataset.csv`**
    *   **Fungsi**: File dataset lokal bertipe CSV berisi contoh data beasiswa dan olimpiade yang digunakan oleh mesin AI sebagai data pencocokan.
*   **`READme.md`**
    *   **Fungsi**: Panduan instalasi dependensi Python, konfigurasi API Key Google Gemini, dan troubleshooting server AI.
