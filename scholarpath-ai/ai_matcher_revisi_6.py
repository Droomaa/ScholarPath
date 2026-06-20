import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
import time

class ScholarPathMatcher:
    def __init__(self, dataset_path, gemini_api_key):
        print("Memuat dataset...")
        self.df = pd.read_csv(dataset_path)
        
        self.df['search_content'] = (
            self.df['title'].astype(str) + " " + 
            self.df['scholarship_path'].astype(str) + " " +
            self.df['activity_type'].astype(str) + " " +
            self.df['description'].astype(str)
        ).str.lower()

        print("Menginisialisasi Model Semantic (Multilingual)...")
        # (Warning HF_TOKEN saat mendownload model ini aman untuk diabaikan)
        self.semantic_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        
        print("Membuat Vector Embeddings (Training Semantik)...")
        self.document_embeddings = self.semantic_model.encode(self.df['search_content'].tolist())

        print("Menginisialisasi Model BM25...")
        tokenized_corpus = [doc.split(" ") for doc in self.df['search_content'].tolist()]
        self.bm25_model = BM25Okapi(tokenized_corpus)
        
        # 2. Inisialisasi API LLM menggunakan SDK BARU
        self.genai_client = genai.Client(api_key=gemini_api_key)
        
        # 3. Fitur Caching (Mencegah double request ke API untuk kata kunci yang sama)
        self.query_cache = {}
        
        print("Sistem AI Siap Digunakan!\n")

    def _dynamic_enrich_query(self, query):
        if query in self.query_cache:
            return self.query_cache[query]

        print(f"[LLM] Menganalisis makna dari: '{query}'...")
        
        prompt = f"""
        Kamu adalah sistem pembuat profil akademik. 
        Seorang siswa memiliki minat/skill di bidang: "{query}".
        
        Tugasmu: Buatlah 1 kalimat naratif (maksimal 15-20 kata) bergaya formal yang 
        mendeskripsikan bahwa siswa tersebut sangat cocok untuk menerima program/beasiswa 
        di bidang kategori makronya (misal: Rekayasa Teknologi, STEM, Sains, atau Ilmu Komputer).
        
        Contoh jika input 'Backend': "Siswa ini memiliki bakat unggul dan sangat cocok untuk program di bidang rekayasa teknologi, teknik informatika, dan ilmu komputer."
        
        Jawab HANYA dengan 1 kalimat utuh tersebut! Jangan gunakan format list atau daftar.
        """
        
        max_retries = 3 # Maksimal 3 kali percobaan
        
        for attempt in range(max_retries):
            try:
                response = self.genai_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                
                # 1. Bersihkan kalimat dari spasi ekstra atau enter
                final_query = response.text.strip().replace("\n", "").lower()
                
                print(f"[LLM] Berhasil! Hipotesis AI: '{final_query}'")
                self.query_cache[query] = final_query 
                return final_query
            
            except Exception as e:
                error_msg = str(e)
                # Jika errornya 503 (Server Sibuk), maka coba lagi
                if '503' in error_msg:
                    if attempt < max_retries - 1:
                        jeda = 2 ** attempt # Menunggu 1 detik, lalu 2 detik
                        print(f"[LLM Warning] Server API penuh (503). Mencoba ulang dalam {jeda} detik... (Percobaan {attempt+2}/{max_retries})")
                        time.sleep(jeda)
                    else:
                        print(f"[LLM Error] API Google benar-benar sibuk setelah {max_retries}x percobaan.")
                else:
                    # Jika error selain 503 (misal kuota habis, koneksi putus), langsung berhenti mencoba
                    print(f"[LLM Error] Error sistem LLM: {error_msg}")
                    break
        
        # --- PERTAHANAN TERAKHIR (HYBRID FALLBACK) ---
        print("[Sistem] Mengaktifkan kamus manual lokal sebagai pengganti LLM...")
        fallback_dict = {
            "kecerdasan buatan": "kecerdasan buatan (artificial intelligence) machine learning rekayasa teknologi",
            "pemrograman": "pemrograman (programming) coding software algoritma informatika rekayasa teknologi engineering",
            "backend": "backend pemrograman server database algoritma informatika rekayasa teknologi engineering",
            "devops": "devops infrastruktur cloud jaringan server otomatisasi rekayasa teknologi", # Kita tambahkan devops di sini
            "data": "data science analisis database pemodelan rekayasa teknologi"
        }
        
        fallback_query = query.lower()
        for key, val in fallback_dict.items():
            if key in fallback_query:
                fallback_query = fallback_query.replace(key, val)
                break # Cukup ambil satu kecocokan
                
        self.query_cache[query] = fallback_query # Simpan hasil manual ini ke cache
        return fallback_query

    def search(self, query, alpha=0.7, top_k=3, filter_type=None, base_threshold=37.0): 
        # Lempar input user ke LLM
        processed_query = self._dynamic_enrich_query(query)

        # Proses BM25 & Semantic
        tokenized_query = processed_query.split(" ")
        bm25_scores = self.bm25_model.get_scores(tokenized_query)
        
        query_embedding = self.semantic_model.encode([processed_query])
        semantic_scores = cosine_similarity(query_embedding, self.document_embeddings)[0]

        # Normalisasi
        semantic_scores_norm = np.clip(semantic_scores, 0, 1)
        max_bm25 = np.max(bm25_scores)
        if max_bm25 > 0:
            bm25_scores_norm = bm25_scores / max(max_bm25, 10.0)
        else:
            bm25_scores_norm = bm25_scores

        hybrid_scores = (alpha * semantic_scores_norm) + ((1 - alpha) * bm25_scores_norm)

        results_df = self.df.copy()
        results_df['match_score_raw'] = hybrid_scores
        results_df['match_score_percentage'] = (hybrid_scores * 100).round(2) 
        
        results_df = results_df[results_df['match_score_percentage'] >= base_threshold]
        
        if filter_type:
            results_df = results_df[results_df['type'].str.lower() == filter_type.lower()]
            
        top_results = results_df.sort_values(by='match_score_percentage', ascending=False)
        
        if top_k is not None:
            top_results = top_results.head(top_k)
        
        return top_results[['title', 'type', 'level', 'match_score_percentage', 'description']]

# --- Cara Penggunaan ---
if __name__ == "__main__":
    # MASUKKAN API KEY GEMINI KAMU DI SINI
    API_KEY = "AIzaSyDzz1MW6DYV5VWzC9e_wYZqX-VSTs0ec0Y" 
    
    matcher = ScholarPathMatcher('new_sample_dataset.csv', API_KEY)
    
    # Uji Coba
    user_skill_input = "Kecerdasan Buatan dan Pemrograman"
    print(f"\nMencari rekomendasi untuk skill: '{user_skill_input}'")
    
    print("\n=== MENCARI BEASISWA SAJA ===")
    rekomendasi_beasiswa = matcher.search(query=user_skill_input, top_k=3, filter_type='scholarship')
    if rekomendasi_beasiswa.empty:
        print("Tidak ada beasiswa yang cocok/semakna.")
    else:
        for index, row in rekomendasi_beasiswa.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']} - {row['level']})")
            print(f"Deskripsi: {row['description']}\n") # <-- Deskripsi dimunculkan kembali

    print("=== MENCARI OLIMPIADE SAJA ===")
    rekomendasi_lomba = matcher.search(query=user_skill_input, top_k=3, filter_type='competition')
    if rekomendasi_lomba.empty:
        print("Tidak ada olimpiade yang cocok/semakna.")
    else:
        for index, row in rekomendasi_lomba.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']} - {row['level']})")
            print(f"Deskripsi: {row['description']}\n") # <-- Deskripsi dimunculkan kembali