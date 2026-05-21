# ScholarPath - AI Matching Engine

Sistem Rekomendasi Beasiswa & Olimpiade Berbasis AI (Hybrid: Semantic + BM25)

## Deskripsi AI

Modul Python ini adalah _core engine_ AI untuk platform ScholarPath. Sistem ini menggunakan arsitektur Decoupled Retrieval (Hybrid AI) yang menggabungkan:

1. Google Gemini (LLM): Bertugas memahami input _skill_ user (misal: "DevOps") dan memperluasnya menjadi kalimat hipotesis (RAG/HyDE) dan kata kunci murni.
2. Sentence-Transformers (MPNet): Algoritma _Semantic Search_ untuk mencocokkan makna kalimat (vektor) dengan tingkat akurasi tinggi.
3. BM25 (Lexical Search): Algoritma pencarian kata kunci presisi tinggi.
4. Local Fallback Dictionary: Sistem pertahanan _anti-limit_ API untuk menjamin _uptime_ 100% jika server cloud Google sedang sibuk.

---

## Persyaratan Sistem (Prerequisites)

Sebelum menjalankan program ini, pastikan laptop/komputer sudah menginstal:

- Python (Versi 3.9 atau lebih baru)
- Koneksi internet yang stabil (sangat dibutuhkan untuk pengunduhan model AI di awal dan pemanggilan API Google).

---

## Panduan Instalasi (Langkah demi Langkah)

### 1. Persiapan File

Pastikan Anda memiliki dua file utama ini dalam satu folder yang sama:

- `ai_matcher_fix.py` (Script program utama)
- `new_sample_dataset.csv` (Database beasiswa dan kompetisi)

### 3. Instalasi Awal & Library (Dependencies)

pip install pandas numpy sentence-transformers rank_bm25 scikit-learn google-genai
pip install google-generativeai
pip install --upgrade google-generativeai //jaga-jaga
pip install google-genai

### 4. Konfigurasi API Key Google Gemini

Sistem ini menggunakan kecerdasan Google Gemini untuk memperluas input pengguna. Anda memerlukan API Key gratis:

Dapatkan API Key secara gratis di Google AI Studio.
Buka file ai_matcher.py menggunakan Code Editor (VS Code, dll).
Scroll ke bagian paling bawah file (pada blok if name == "main":).
Ganti teks "MASUKKAN_API_KEY_KAMU_DISINI" dengan API Key milik Anda.

▶️ Cara Menjalankan Program
Setelah semua persiapan di atas selesai, jalankan perintah ini di Terminal/CMD: python ai_matcher.py

⚠️ PERHATIAN PENTING PADA SAAT RUNNING PERTAMA KALI (FIRST RUN):
Saat Anda mengeksekusi program ini untuk pertama kalinya, Python akan secara otomatis mengunduh model semantik paraphrase-multilingual-mpnet-base-v2 dari HuggingFace.

Ukuran model ini sekitar 1 GB.
Proses ini membutuhkan waktu beberapa menit (tergantung kecepatan internet Anda).
Progress bar akan muncul di terminal. Mohon jangan menutup terminal selama proses ini berlangsung.
Pada running kedua dan seterusnya, proses ini akan dilewati dan program akan langsung menyala dalam hitungan detik.

Troubleshooting & Info Tambahan
Peringatan HF_TOKEN (Hugging Face): Jika muncul warning tentang HF_TOKEN saat mendownload model, abaikan saja. Itu hanya peringatan opsional dan tidak mengganggu jalannya program.

Error 429 (Resource Exhausted) / 503 (Service Unavailable): Jika muncul log error ini, artinya kuota API Google Gemini Anda sedang penuh atau server sedang sibuk. Jangan panik. Sistem ScholarPath telah dilengkapi dengan Local Fallback Dictionary. Program tidak akan crash dan akan otomatis menggunakan kamus lokal internal untuk melanjutkan pencarian.
