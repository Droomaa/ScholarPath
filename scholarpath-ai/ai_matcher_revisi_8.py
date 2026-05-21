import pandas as pd
import numpy as np
import time
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity
from google import genai

class ScholarPathMatcher:
    def __init__(self, dataset_path, gemini_api_key):
        print("Memuat dataset...")
        self.df = pd.read_csv(dataset_path)
        
        # Menggabungkan metadata spesifik (termasuk path/engineering) agar terbaca oleh AI
        self.df['search_content'] = (
            self.df['title'].astype(str) + " " + 
            self.df['scholarship_path'].astype(str) + " " +
            self.df['activity_type'].astype(str) + " " +
            self.df['description'].astype(str)
        ).str.lower()

        print("Menginisialisasi Model Semantic (Multilingual MPNet)...")
        self.semantic_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        
        print("Membuat Vector Embeddings (Training Semantik)...")
        self.document_embeddings = self.semantic_model.encode(self.df['search_content'].tolist())

        print("Menginisialisasi Model BM25 (Lexical)...")
        tokenized_corpus = [doc.split(" ") for doc in self.df['search_content'].tolist()]
        self.bm25_model = BM25Okapi(tokenized_corpus)
        
        # Inisialisasi API LLM menggunakan SDK Google GenAI terbaru
        self.genai_client = genai.Client(api_key=gemini_api_key)
        
        # Sistem Caching untuk mempercepat microservices (mencegah request berulang)
        self.query_cache = {}
        
        print("Sistem AI Siap Digunakan!\n")

    def _dynamic_enrich_query(self, query):
        if query in self.query_cache:
            return self.query_cache[query]

        print(f"[Sistem] Memeriksa ketersediaan API Google untuk: '{query}'...")
        
        # --- BLOK API GOOGLE (Dengan pengaman kuota) ---
        prompt = f"""
        Kamu adalah mesin pemrosesan NLP. Keahlian input: "{query}".
        Tugasmu menghasilkan tepat 2 baris teks (tanpa label/markdown/format apapun):
        Baris 1: 1 kalimat naratif (maksimal 15 kata) menyatakan siswa ini cocok masuk ke rumpun ilmunya (misal: Rekayasa Teknologi, STEM, Sains, dll).
        Baris 2: 3-5 kata kunci teknis spesifik murni terkait keahliannya (pisahkan dengan spasi, tanpa kata hubung).
        """
        
        try:
            # Sistem mencoba memanggil API 1 kali saja untuk menghemat waktu jika sedang limit
            response = self.genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            
            lines = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
            if len(lines) >= 2:
                semantic_query, keyword_query = lines[0].lower(), f"{query} {lines[1]}".lower()
            else:
                semantic_query, keyword_query = lines[0].lower(), query.lower()
                
            print(f"[LLM] Berhasil! Menggunakan AI Cloud.")
            self.query_cache[query] = (semantic_query, keyword_query)
            return self.query_cache[query]
            
        except Exception as e:
            error_msg = str(e)
            if '429' in error_msg:
                print("[Sistem] Kuota API habis (429). Beralih ke Kamus Lokal ScholarPath...")
            elif '503' in error_msg:
                print("[Sistem] Server API sibuk (503). Beralih ke Kamus Lokal ScholarPath...")
            else:
                print(f"[Sistem] API Error: {error_msg}. Beralih ke Kamus Lokal...")

        # =====================================================================
        # KAMUS MANUAL LOKAL (Berdasarkan Ekstraksi Dataset CSV ScholarPath)
        # Format: "kata_kunci_user": ("Kalimat Semantic", "Kata_Kunci_BM25")
        # =====================================================================
        
        fallback_dict = {
            # 1. RUMPUN TEKNOLOGI & KOMPUTER (Engineering & STEM)
            "pemrograman": ("siswa ini sangat selaras dengan rumpun ilmu teknik informatika dan rekayasa teknologi.", "algoritma struktur data komputer informatika perangkat lunak"),
            "backend": ("siswa ini sangat selaras dengan rumpun ilmu teknik informatika dan rekayasa teknologi.", "algoritma struktur data komputer informatika perangkat lunak server"),
            "frontend": ("siswa ini sangat selaras dengan desain aplikasi dan rumpun teknik informatika.", "desain antarmuka pengguna ui ux aplikasi web"),
            "kecerdasan buatan": ("siswa ini potensial di bidang ilmu komputer, algoritma dan rekayasa teknologi inovasi.", "algoritma struktur data informatika mesin komputer teknologi"),
            "ai": ("siswa ini potensial di bidang ilmu komputer, algoritma dan rekayasa teknologi inovasi.", "algoritma struktur data informatika mesin komputer teknologi"),
            "robotika": ("siswa ini memiliki minat pada bidang rekayasa teknologi, stem, dan desain mekanik.", "robotika desain pemrograman robot inovasi mesin"),
            "ui": ("siswa ini berpotensi dalam kompetisi desain antarmuka dan pengembangan pengalaman pengguna aplikasi.", "desain antarmuka pengguna pengalaman aplikasi desain"),
            "ux": ("siswa ini berpotensi dalam kompetisi desain antarmuka dan pengembangan pengalaman pengguna aplikasi.", "desain antarmuka pengguna pengalaman aplikasi desain"),

            # 2. RUMPUN SAINS DASAR (STEM & Science)
            "matematika": ("siswa ini sangat cocok untuk program di bidang stem dan pemodelan analitis.", "matematika pemodelan aplikasi terapan hitung"),
            "biologi": ("siswa ini memiliki minat yang kuat di bidang sains, ekologi, dan bioteknologi alam.", "biologi sel genetika ekologi fisiologi sains alam"),
            "fisika": ("siswa ini memiliki potensi di bidang sains fisika dan rekayasa mekanika murni.", "fisika mekanika termodinamika elektromagnetisme sains alam"),
            "kimia": ("siswa ini berpotensi dalam bidang sains analitik, reaksi, dan eksperimen laboratorium.", "kimia organik anorganik analitik sains eksperimen"),
            "astronomi": ("siswa ini memiliki minat pada sains antariksa dan pengamatan benda langit.", "astronomi mekanika langit astrofisika bintang sains alam"),
            "kebumian": ("siswa ini cocok untuk program studi sains bumi, oseanografi, dan lingkungan.", "geologi meteorologi oseanografi kebumian sains alam"),
            "ipa": ("siswa ini sangat cocok untuk program studi sains dasar dan stem terpadu.", "fisika biologi kimia sains dasar alam"),

            # 3. RUMPUN SOSIAL, BAHASA & HUMANIORA (General)
            "bahasa inggris": ("siswa ini memiliki kemampuan unggul dalam komunikasi global dan literasi bahasa.", "debat bahasa inggris public speaking argumen internasional"),
            "bahasa": ("siswa ini memiliki kemampuan unggul dalam komunikasi global dan literasi bahasa.", "debat bahasa public speaking argumen internasional sastra"),
            "sastra": ("siswa ini memiliki bakat di bidang seni sastra dan penulisan kreatif nusantara.", "puisi cerpen sastra indonesia penulisan seni bahasa"),
            "menulis": ("siswa ini memiliki bakat di bidang seni sastra dan penulisan kreatif nusantara.", "puisi cerpen sastra indonesia penulisan seni bahasa"),
            "sejarah": ("siswa ini memiliki minat yang kuat terhadap wawasan sejarah dan budaya bangsa.", "sejarah museum wawasan budaya sosial peninggalan"),
            "ekonomi": ("siswa ini berpotensi di bidang ilmu sosial, ekonomi, dan manajerial keuangan bisnis.", "ekonomi makro mikro akuntansi bisnis keuangan sosial"),
            "akuntansi": ("siswa ini berpotensi di bidang ilmu sosial, ekonomi, dan manajerial keuangan bisnis.", "ekonomi makro mikro akuntansi bisnis keuangan sosial"),
            "geografi": ("siswa ini memiliki kemampuan analitis ruang dalam ilmu geografi dan pemetaan wilayah.", "geografi fisik manusia kartografi sig sosial wilayah"),

            # 4. KEPEMIMPINAN & ORGANISASI (General)
            "kepemimpinan": ("siswa ini memiliki bakat manajerial dan kepemimpinan dalam organisasi kepemudaan.", "kepemimpinan osis manajerial pramuka organisasi kader"),
            "organisasi": ("siswa ini memiliki bakat manajerial dan kepemimpinan dalam organisasi kepemudaan.", "kepemimpinan osis manajerial pramuka organisasi kader"),
            "pramuka": ("siswa ini berprestasi dalam kegiatan kepanduan, manajerial, dan organisasi kepemudaan.", "pramuka kepanduan organisasi kepemimpinan kader"),

            # 5. OLAHRAGA & SENI (General)
            "olahraga": ("siswa ini berprestasi di bidang olahraga, kebugaran, dan kesehatan fisik.", "olahraga atletik renang pencak silat karate fisik"),
            "atletik": ("siswa ini berprestasi di bidang olahraga, kebugaran, dan kesehatan fisik.", "olahraga atletik renang fisik"),
            "seni": ("siswa ini memiliki kreativitas tinggi di bidang seni pertunjukan dan budaya.", "seni budaya kreativitas pertunjukan pementasan"),
            "tari": ("siswa ini memiliki kreativitas tinggi di bidang seni pertunjukan dan budaya.", "seni budaya kreativitas pertunjukan pementasan"),

            # 6. KEAGAMAAN & KESEHATAN (General)
            "agama": ("siswa ini berprestasi di bidang keagamaan dan literasi kitab suci.", "agama islam mtq tilawah tahfidz tafsir nu muhammadiyah"),
            "islam": ("siswa ini berprestasi di bidang keagamaan dan literasi kitab suci.", "agama islam mtq tilawah tahfidz tafsir nu muhammadiyah"),
            "kesehatan": ("siswa ini memiliki kepedulian di bidang kesehatan dan pertolongan medis dasar.", "pmr kesehatan sanitasi pertolongan medis"),
            "pmr": ("siswa ini memiliki kepedulian di bidang kesehatan dan pertolongan medis dasar.", "pmr kesehatan sanitasi pertolongan medis")
        }

        # Setup nilai default jika kata kunci user benar-benar acak dan tidak ada di kamus
        query_lower = query.lower()
        fallback_semantic = "siswa ini memiliki potensi besar untuk mengikuti program akademik berprestasi."
        fallback_keyword = query_lower

        # Melakukan pencarian di dalam kamus
        for key, (semantic, keyword) in fallback_dict.items():
            if key in query_lower: # Menggunakan 'in' agar input seperti "Suka Matematika" tetap terdeteksi
                fallback_semantic = semantic
                fallback_keyword = f"{query_lower} {keyword}"
                break # Berhenti di kecocokan pertama

        print(f"[Sistem] Menggunakan Kamus Lokal untuk: '{query_lower}'")
        self.query_cache[query] = (fallback_semantic, fallback_keyword)
        
        return self.query_cache[query]

    def search(self, query, alpha=0.7, top_k=3, filter_type=None, base_threshold=35.0): 
        # 1. Terima dua versi query yang berbeda (Decoupled Retrieval)
        semantic_query, keyword_query = self._dynamic_enrich_query(query)

        # 2. Proses BM25 (Hanya pakai Keyword agar tidak ada skor palsu dari stopwords)
        tokenized_query = keyword_query.split(" ")
        bm25_scores = self.bm25_model.get_scores(tokenized_query)
        
        # 3. Proses Semantic (Hanya pakai Kalimat Utuh agar maknanya kaya dan tata bahasanya selaras)
        query_embedding = self.semantic_model.encode([semantic_query])
        semantic_scores = cosine_similarity(query_embedding, self.document_embeddings)[0]

        # 4. Normalisasi Manual Terkendali
        semantic_scores_norm = np.clip(semantic_scores, 0, 1)
        max_bm25 = np.max(bm25_scores)
        if max_bm25 > 0:
            bm25_scores_norm = bm25_scores / max(max_bm25, 10.0) # Redaman agar skor 1 kata tidak jadi 100%
        else:
            bm25_scores_norm = bm25_scores

        # 5. Kalkulasi Hybrid Score
        hybrid_scores = (alpha * semantic_scores_norm) + ((1 - alpha) * bm25_scores_norm)

        results_df = self.df.copy()
        results_df['match_score_raw'] = hybrid_scores
        results_df['match_score_percentage'] = (hybrid_scores * 100).round(2) 
        
        # --- NOISE FILTER ---
        # Membuang data yang skornya di bawah ambang batas rasional (default 35%)
        results_df = results_df[results_df['match_score_percentage'] >= base_threshold]
        
        # --- FILTERING KATEGORI ---
        if filter_type:
            results_df = results_df[results_df['type'].str.lower() == filter_type.lower()]
            
        # Urutkan dari skor tertinggi
        top_results = results_df.sort_values(by='match_score_percentage', ascending=False)
        
        # Potong hasil sesuai batasan UI/top_k
        if top_k is not None:
            top_results = top_results.head(top_k)
        
        return top_results[['title', 'type', 'level', 'match_score_percentage', 'description']]

# --- Cara Penggunaan & Pengujian ---
if __name__ == "__main__":
    # ⚠️ JANGAN LUPA GANTI INI DENGAN API KEY ASLI MILIKMU ⚠️
    API_KEY = "AIzaSyDzz1MW6DYV5VWzC9e_wYZqX-VSTs0ec0Y" 
    
    matcher = ScholarPathMatcher('new_sample_dataset.csv', API_KEY)
    
    # Simulasi input spesifik yang sering menjadi edge-case
    user_skill_input = "Matematika"
    print(f"\nMencari rekomendasi untuk skill: '{user_skill_input}'")
    
    print("\n=== MENCARI BEASISWA SAJA ===")
    rekomendasi_beasiswa = matcher.search(query=user_skill_input, top_k=3, filter_type='scholarship')
    
    if rekomendasi_beasiswa.empty:
        print("Tidak ada beasiswa yang cocok/semakna.")
    else:
        for index, row in rekomendasi_beasiswa.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']} - {row['level']})")
            print(f"Deskripsi: {row['description']}\n")

    print("=== MENCARI OLIMPIADE SAJA ===")
    # Proses kedua ini akan instan (Cache Hit)
    rekomendasi_lomba = matcher.search(query=user_skill_input, top_k=3, filter_type='competition')
    
    if rekomendasi_lomba.empty:
        print("Tidak ada olimpiade yang cocok/semakna.")
    else:
        for index, row in rekomendasi_lomba.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']} - {row['level']})")
            print(f"Deskripsi: {row['description']}\n")