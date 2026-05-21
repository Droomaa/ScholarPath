import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

class ScholarPathMatcher:
    def __init__(self, dataset_path):
        print("Memuat dataset...")
        self.df = pd.read_csv(dataset_path)
        
        # PERBAIKAN 1: Tambahkan scholarship_path dan activity_type agar AI tahu konteks bidangnya
        self.df['search_content'] = (
            self.df['title'].astype(str) + " " + 
            self.df['scholarship_path'].astype(str) + " " +  # <-- Kunci untuk mendeteksi Engineering/STEM dsb
            self.df['activity_type'].astype(str) + " " +
            self.df['description'].astype(str)
        ).str.lower()

        print("Menginisialisasi Model Semantic (Multilingual)...")
        # PERBAIKAN 2: Upgrade ke model yang lebih cerdas memahami frasa utuh
        self.semantic_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        
        print("Membuat Vector Embeddings (Training Semantik)...")
        self.document_embeddings = self.semantic_model.encode(self.df['search_content'].tolist())

        print("Menginisialisasi Model BM25...")
        tokenized_corpus = [doc.split(" ") for doc in self.df['search_content'].tolist()]
        self.bm25_model = BM25Okapi(tokenized_corpus)
        
        self.scaler = MinMaxScaler()
        print("Sistem AI Siap Digunakan!\n")

    def _enrich_query(self, query):
        """
        Fungsi NLP pra-pemrosesan untuk mengunci konteks istilah teknis 
        agar tidak tumpang tindih dengan kata umum, dan menjembatani 
        istilah industri dengan bahasa akademis di database.
        """
        enrichment_dict = {
            # Kategori AI & Data
            "kecerdasan buatan": "kecerdasan buatan (artificial intelligence) machine learning",
            "data": "data science analisis database pemodelan",
            
            # Kategori Software Engineering (termasuk spesialisasi)
            "pemrograman": "pemrograman (programming) coding software algoritma informatika",
            "backend": "backend pemrograman (programming) server database algoritma informatika struktur data",
            "frontend": "frontend pemrograman (programming) web antarmuka ui ux informatika",
            "fullstack": "fullstack pemrograman (programming) web backend frontend informatika",
            "mobile": "mobile apps pemrograman (programming) aplikasi smartphone informatika",
            
            # Kategori Infrastruktur
            "jaringan": "jaringan (computer networking) cisco mikrotik infrastruktur",
        }
        
        enriched_query = query.lower()
        for key, val in enrichment_dict.items():
            if key in enriched_query:
                enriched_query = enriched_query.replace(key, val)
                
        return enriched_query

    def search(self, query, alpha=0.7, top_k=3, filter_type=None, base_threshold=40.0): 
        # 0. Lakukan pengayaan pada input user
        processed_query = self._enrich_query(query)

        # 1. Hitung Skor BM25 (Lexical)
        tokenized_query = processed_query.split(" ")
        bm25_scores = self.bm25_model.get_scores(tokenized_query)
        
        # 2. Hitung Skor Semantic (Cosine Similarity)
        query_embedding = self.semantic_model.encode([processed_query])
        semantic_scores = cosine_similarity(query_embedding, self.document_embeddings)[0]

        # 3. NORMALISASI YANG BENAR (Tanpa MinMaxScaler)
        # Cosine similarity sudah di rentang -1 sampai 1, kita pastikan minimal 0
        semantic_scores_norm = np.clip(semantic_scores, 0, 1)
        
        # Normalisasi BM25 manual
        max_bm25 = np.max(bm25_scores)
        if max_bm25 > 0:
            # Menggunakan batas redam (10.0) agar match 1 kata (skor kecil) tidak disulap jadi 100%
            bm25_scores_norm = bm25_scores / max(max_bm25, 10.0)
        else:
            bm25_scores_norm = bm25_scores

        # 4. Kalkulasi Hybrid Score
        hybrid_scores = (alpha * semantic_scores_norm) + ((1 - alpha) * bm25_scores_norm)

        # 5. Gabungkan skor ke dataframe
        results_df = self.df.copy()
        results_df['match_score_raw'] = hybrid_scores
        results_df['match_score_percentage'] = (hybrid_scores * 100).round(2) 
        
        # --- FITUR NOISE FILTER ---
        results_df = results_df[results_df['match_score_percentage'] >= base_threshold]
        
        # --- FITUR FILTERING KATEGORI ---
        if filter_type:
            results_df = results_df[results_df['type'].str.lower() == filter_type.lower()]
            
        # Urutkan dari skor tertinggi
        top_results = results_df.sort_values(by='match_score_percentage', ascending=False)
        
        if top_k is not None:
            top_results = top_results.head(top_k)
        
        return top_results[['title', 'type', 'level', 'match_score_percentage', 'description']]

# --- Cara Penggunaan ---
if __name__ == "__main__":
    matcher = ScholarPathMatcher('new_sample_dataset.csv')
    
    # Kamu bisa ubah input ini untuk testing
    user_skill_input = "Backend"
    
    print(f"\nMencari rekomendasi untuk skill: '{user_skill_input}'")
    
    print("\n=== MENCARI BEASISWA SAJA ===")
    rekomendasi_beasiswa = matcher.search(
        query=user_skill_input, 
        alpha=0.7, 
        top_k=3, # top_k bisa diatur untuk menampilkan berapa data yang muncul (ubah jadi None jika ingin semua)
        filter_type='scholarship',
        base_threshold=40.0 # Batas minimal 40%
    )
    
    if rekomendasi_beasiswa.empty:
        print("Tidak ada beasiswa yang cocok/semakna.")
    else:
        for index, row in rekomendasi_beasiswa.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']})")
            print(f"Deskripsi: {row['description']}\n")

    print("=== MENCARI OLIMPIADE SAJA ===")
    rekomendasi_lomba = matcher.search(
        query=user_skill_input, 
        alpha=0.7, 
        top_k=3, 
        filter_type='competition',
        base_threshold=40.0 # Batas minimal 40%
    )
    
    if rekomendasi_lomba.empty:
        print("Tidak ada olimpiade yang cocok/semakna.")
    else:
        for index, row in rekomendasi_lomba.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']})")
            print(f"Deskripsi: {row['description']}\n")