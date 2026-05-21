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
        """
        Fungsi Decoupled Retrieval: 
        Minta LLM menghasilkan 2 versi query (Kalimat Utuh untuk Semantic, Kata Kunci untuk BM25).
        """
        if query in self.query_cache:
            return self.query_cache[query]

        print(f"[LLM] Menganalisis makna ganda dari: '{query}'...")
        
        prompt = f"""
        Kamu adalah mesin pemrosesan NLP. Keahlian input: "{query}".
        
        Tugasmu menghasilkan tepat 2 baris teks (tanpa label/markdown/format apapun):
        Baris 1: 1 kalimat naratif (maksimal 15 kata) menyatakan siswa ini cocok masuk ke rumpun ilmunya (misal: Rekayasa Teknologi, STEM, Sains, dll).
        Baris 2: 3-5 kata kunci teknis spesifik murni terkait keahliannya (pisahkan dengan spasi, tanpa kata hubung).
        """
        
        max_retries = 3
        
        for attempt in range(max_retries):
            print(f"[LLM] Menghubungi API Google... (Percobaan {attempt+1}/{max_retries})")
            try:
                response = self.genai_client.models.generate_content(
                    model='gemini-2.5-flash', # Bisa diganti gemini-2.0-flash jika 2.5 belum tersedia di regionmu
                    contents=prompt
                )
                
                # Memecah response LLM berdasarkan baris (Enter)
                lines = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
                
                if len(lines) >= 2:
                    semantic_query = lines[0].lower() 
                    keyword_query = f"{query} {lines[1]}".lower() 
                else:
                    semantic_query = lines[0].lower()
                    keyword_query = query.lower()
                
                print(f"[LLM] Semantic Context : '{semantic_query}'")
                print(f"[LLM] Keyword BM25     : '{keyword_query}'")
                
                # Simpan KEDUANYA di dalam cache sebagai Tuple
                self.query_cache[query] = (semantic_query, keyword_query)
                return self.query_cache[query]
                
            except Exception as e:
                error_msg = str(e)
                if '503' in error_msg:
                    if attempt < max_retries - 1:
                        jeda = 2 ** attempt
                        print(f"[LLM Warning] Server API penuh (503). Mencoba ulang dalam {jeda} detik... (Percobaan {attempt+2}/{max_retries})")
                        time.sleep(jeda)
                    else:
                        print(f"[LLM Error] API Google benar-benar sibuk setelah {max_retries}x percobaan.")
                else:
                    print(f"[LLM Error] {error_msg}")
                    break
        
        # --- HYBRID FALLBACK LOKAL (Jika API Mati) ---
        print("[Sistem] Mengaktifkan kamus manual lokal sebagai pengganti LLM...")
        fallback_semantic = f"siswa ini cocok untuk program beasiswa di bidang rekayasa teknologi dan stem.".lower()
        fallback_keyword = f"{query} rekayasa teknologi informatika algoritma".lower()
        
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