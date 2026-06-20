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

    # PERBAIKAN 3: Fitur Query Enrichment untuk mencegah tumpang tindih kata (Lexical Ambiguity)
    def _enrich_query(self, query):
        """
        Fungsi NLP pra-pemrosesan untuk mengunci konteks istilah teknis 
        agar tidak tumpang tindih dengan kata umum.
        """
        enrichment_dict = {
            "kecerdasan buatan": "kecerdasan buatan (artificial intelligence) machine learning",
            "pemrograman": "pemrograman (programming) coding software algoritma",
            "jaringan": "jaringan (computer networking) cisco mikrotik",
            # Kamu bisa tambahkan istilah lain ke depannya di sini sesuai kebutuhan
        }
        
        enriched_query = query.lower()
        for key, val in enrichment_dict.items():
            if key in enriched_query:
                enriched_query = enriched_query.replace(key, val)
                
        return enriched_query

    def search(self, query, alpha=0.7, top_k=3, filter_type=None, base_threshold=40.0): 
        # 0. Lakukan pengayaan pada input user
        processed_query = self._enrich_query(query)

        # 1. Hitung Skor BM25 (Lexical) menggunakan processed_query
        tokenized_query = processed_query.split(" ")
        bm25_scores = self.bm25_model.get_scores(tokenized_query)
        
        # 2. Hitung Skor Semantic (Cosine Similarity) menggunakan processed_query
        query_embedding = self.semantic_model.encode([processed_query])
        semantic_scores = cosine_similarity(query_embedding, self.document_embeddings)[0]

        # 3. Normalisasi Skor
        bm25_scores_norm = self.scaler.fit_transform(bm25_scores.reshape(-1, 1)).flatten()
        semantic_scores_norm = self.scaler.fit_transform(semantic_scores.reshape(-1, 1)).flatten()

        # 4. Kalkulasi Hybrid Score
        hybrid_scores = (alpha * semantic_scores_norm) + ((1 - alpha) * bm25_scores_norm)

        # 5. Gabungkan skor ke dataframe
        results_df = self.df.copy()
        results_df['match_score_raw'] = hybrid_scores
        results_df['match_score_percentage'] = (hybrid_scores * 100).round(2) 
        
        # --- FITUR NOISE FILTER (BUANG YANG TIDAK SEMAKNA) ---
        # Hanya ambil data yang skornya memenuhi batas minimum relevansi
        results_df = results_df[results_df['match_score_percentage'] >= base_threshold]
        
        # --- FITUR FILTERING KATEGORI ---
        if filter_type:
            results_df = results_df[results_df['type'].str.lower() == filter_type.lower()]
            
        # Urutkan dari skor tertinggi
        top_results = results_df.sort_values(by='match_score_percentage', ascending=False)
        
        # Jika top_k diatur (tidak None), maka potong hasilnya
        if top_k is not None:
            top_results = top_results.head(top_k)
        
        return top_results[['title', 'type', 'level', 'match_score_percentage', 'description']]

# --- Cara Penggunaan ---
if __name__ == "__main__":
    matcher = ScholarPathMatcher('new_sample_dataset.csv')
    
    # Kamu bisa ubah input ini untuk testing
    user_skill_input = "Kecerdasan Buatan"
    
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