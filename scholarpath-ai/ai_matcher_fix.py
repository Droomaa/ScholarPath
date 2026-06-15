import pandas as pd
import numpy as np
import time
import requests
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity
from google import genai

class ScholarPathMatcher:
    def __init__(self, dataset_path, gemini_api_key):
        self.dataset_path = dataset_path
        
        self.semantic_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        self.genai_client = genai.Client(api_key=gemini_api_key)
        self.query_cache = {}

        print("⚡ Memuat Dataset CSV Statis dan Pre-Computing Embeddings (HANYA SEKALI)...")
        # 1. BACA DATA CSV (STATIS)
        try:
            df_csv = pd.read_csv(self.dataset_path)
            if 'activity_type' in df_csv.columns:
                df_csv['category'] = df_csv['activity_type']
            if 'scholarship_path' in df_csv.columns:
                df_csv['type'] = df_csv['scholarship_path'].apply(
                    lambda x: 'scholarship' if 'beasiswa' in str(x).lower() else 'competition'
                )
            if 'program_name' in df_csv.columns:
                df_csv['title'] = df_csv['program_name']
            if 'id' not in df_csv.columns:
                df_csv['id'] = range(10000, 10000 + len(df_csv))
            if 'status' not in df_csv.columns:
                df_csv['status'] = 'active'
                
            columns_to_keep = ['id', 'title', 'type', 'level', 'category', 'description', 'status']
            existing_cols = [col for col in columns_to_keep if col in df_csv.columns]
            self.static_df = df_csv[existing_cols].fillna('')
        except Exception as e:
            print(f"❌ Gagal membaca CSV lokal: {e}")
            self.static_df = pd.DataFrame(columns=['id', 'title', 'type', 'level', 'category', 'description', 'status'])

        # PRE-COMPUTE STATIC EMBEDDINGS
        self.static_df['search_content'] = (
            self.static_df['title'].astype(str) + " " + 
            self.static_df['description'].astype(str)
        ).str.lower()
        
        self.static_embeddings = self.semantic_model.encode(self.static_df['search_content'].tolist())
        print(f"✅ Sukses Pre-Compute {len(self.static_df)} program CSV statis ke dalam RAM Global!")

    def _get_live_programs(self, live_programs_payload):
        if live_programs_payload:
            return live_programs_payload
            
        # Fallback to direct fetch
        backend_url = "http://localhost:8080/api"
        programs = []
        try:
            res_b = requests.get(f"{backend_url}/beasiswa", timeout=2)
            if res_b.status_code == 200 and 'application/json' in res_b.headers.get('Content-Type', ''):
                raw = res_b.json()
                data_b = raw.get('data', []) if isinstance(raw, dict) else raw if isinstance(raw, list) else []
                for b in data_b:
                    programs.append({
                        'id': b.get('id'),
                        'title': b.get('nama') or b.get('title', ''),
                        'type': 'scholarship',
                        'level': 'Nasional',
                        'category': 'Beasiswa',
                        'description': b.get('deskripsi', ''),
                        'status': b.get('status', 'active')
                    })
        except: pass
        try:
            res_o = requests.get(f"{backend_url}/olimpiade", timeout=2)
            if res_o.status_code == 200 and 'application/json' in res_b.headers.get('Content-Type', ''):
                raw = res_o.json()
                data_o = raw.get('data', []) if isinstance(raw, dict) else raw if isinstance(raw, list) else []
                for o in data_o:
                    programs.append({
                        'id': o.get('id'),
                        'title': o.get('judul') or o.get('title', ''),
                        'type': 'competition',
                        'level': 'Nasional',
                        'category': o.get('tipe_lomba', 'Akademik'),
                        'description': o.get('deskripsi', ''),
                        'status': o.get('status', 'active')
                    })
        except: pass
        return programs

    def _dynamic_enrich_query(self, query):
        if query in self.query_cache:
            return self.query_cache[query]

        prompt = f"""
        Kamu adalah mesin pemrosesan NLP. Keahlian input: "{query}".
        Tugasmu menghasilkan tepat 2 baris teks (tanpa label/markdown/format apapun):
        Baris 1: 1 kalimat naratif (maksimal 15 kata) menyatakan siswa ini cocok masuk ke rumpun ilmunya (misal: Rekayasa Teknologi, STEM, Sains, dll).
        Baris 2: 3-5 kata kunci teknis spesifik murni terkait keahliannya (pisahkan dengan spasi, tanpa kata hubung).
        """
        
        try:
            response = self.genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            
            lines = [line.strip() for line in response.text.strip().split('\n') if line.strip()]
            if len(lines) >= 2:
                semantic_query, keyword_query = lines[0].lower(), f"{query} {lines[1]}".lower()
            else:
                semantic_query, keyword_query = lines[0].lower(), query.lower()
                
            self.query_cache[query] = (semantic_query, keyword_query)
            return self.query_cache[query]
            
        except Exception:
            pass # Melewati error API secara diam-diam dan langsung beralih ke kamus lokal

        fallback_dict = {
            "pemrograman": ("siswa ini sangat selaras dengan rumpun ilmu teknik informatika dan rekayasa teknologi.", "algoritma struktur data komputer informatika perangkat lunak"),
            "backend": ("siswa ini sangat selaras dengan rumpun ilmu teknik informatika dan rekayasa teknologi.", "algoritma struktur data komputer informatika perangkat lunak server"),
            "frontend": ("siswa ini sangat selaras dengan desain aplikasi dan rumpun teknik informatika.", "desain antarmuka pengguna ui ux aplikasi web"),
            "kecerdasan buatan": ("siswa ini potensial di bidang ilmu komputer, algoritma dan rekayasa teknologi inovasi.", "algoritma struktur data informatika mesin komputer teknologi"),
            "ai": ("siswa ini potensial di bidang ilmu komputer, algoritma dan rekayasa teknologi inovasi.", "algoritma struktur data informatika mesin komputer teknologi"),
            "robotika": ("siswa ini memiliki minat pada bidang rekayasa teknologi, stem, dan desain mekanik.", "robotika desain pemrograman robot inovasi mesin"),
            "ui": ("siswa ini berpotensi dalam kompetisi desain antarmuka dan pengembangan pengalaman pengguna aplikasi.", "desain antarmuka pengguna pengalaman aplikasi desain"),
            "ux": ("siswa ini berpotensi dalam kompetisi desain antarmuka dan pengembangan pengalaman pengguna aplikasi.", "desain antarmuka pengguna pengalaman aplikasi desain"),
            "matematika": ("siswa ini sangat cocok untuk program di bidang stem dan pemodelan analitis.", "matematika pemodelan aplikasi terapan hitung"),
            "biologi": ("siswa ini memiliki minat yang kuat di bidang sains, ekologi, dan bioteknologi alam.", "biologi sel genetika ekologi fisiologi sains alam"),
            "fisika": ("siswa ini memiliki potensi di bidang sains fisika dan rekayasa mekanika murni.", "fisika mekanika termodinamika elektromagnetisme sains alam"),
            "kimia": ("siswa ini berpotensi dalam bidang sains analitik, reaksi, dan eksperimen laboratorium.", "kimia organik anorganik analitik sains eksperimen"),
            "astronomi": ("siswa ini memiliki minat pada sains antariksa dan pengamatan benda langit.", "astronomi mekanika langit astrofisika bintang sains alam"),
            "kebumian": ("siswa ini cocok untuk program studi sains bumi, oseanografi, dan lingkungan.", "geologi meteorologi oseanografi kebumian sains alam"),
            "ipa": ("siswa ini sangat cocok untuk program studi sains dasar dan stem terpadu.", "fisika biologi kimia sains dasar alam"),
            "bahasa inggris": ("siswa ini memiliki kemampuan unggul dalam komunikasi global dan literasi bahasa.", "debat bahasa inggris public speaking argumen internasional"),
            "bahasa": ("siswa ini memiliki kemampuan unggul dalam komunikasi global dan literasi bahasa.", "debat bahasa public speaking argumen internasional sastra"),
            "sastra": ("siswa ini memiliki bakat di bidang seni sastra dan penulisan kreatif nusantara.", "puisi cerpen sastra indonesia penulisan seni bahasa"),
            "menulis": ("siswa ini memiliki bakat di bidang seni sastra dan penulisan kreatif nusantara.", "puisi cerpen sastra indonesia penulisan seni bahasa"),
            "sejarah": ("siswa ini memiliki minat yang kuat terhadap wawasan sejarah dan budaya bangsa.", "sejarah museum wawasan budaya sosial peninggalan"),
            "ekonomi": ("siswa ini berpotensi di bidang ilmu sosial, ekonomi, dan manajerial keuangan bisnis.", "ekonomi makro mikro akuntansi bisnis keuangan sosial"),
            "akuntansi": ("siswa ini berpotensi di bidang ilmu sosial, ekonomi, dan manajerial keuangan bisnis.", "ekonomi makro mikro akuntansi bisnis keuangan sosial"),
            "geografi": ("siswa ini memiliki kemampuan analitis ruang dalam ilmu geografi dan pemetaan wilayah.", "geografi fisik manusia kartografi sig sosial wilayah"),
            "kepemimpinan": ("siswa ini memiliki bakat manajerial dan kepemimpinan dalam organisasi kepemudaan.", "kepemimpinan osis manajerial pramuka organisasi kader"),
            "organisasi": ("siswa ini memiliki bakat manajerial dan kepemimpinan dalam organisasi kepemudaan.", "kepemimpinan osis manajerial pramuka organisasi kader"),
            "pramuka": ("siswa ini berprestasi dalam kegiatan kepanduan, manajerial, dan organisasi kepemudaan.", "pramuka kepanduan organisasi kepemimpinan kader"),
            "olahraga": ("siswa ini berprestasi di bidang olahraga, kebugaran, dan kesehatan fisik.", "olahraga atletik renang pencak silat karate fisik"),
            "atletik": ("siswa ini berprestasi di bidang olahraga, kebugaran, dan kesehatan fisik.", "olahraga atletik renang fisik"),
            "seni": ("siswa ini memiliki kreativitas tinggi di bidang seni pertunjukan dan budaya.", "seni budaya kreativitas pertunjukan pementasan"),
            "tari": ("siswa ini memiliki kreativitas tinggi di bidang seni pertunjukan dan budaya.", "seni budaya kreativitas pertunjukan pementasan"),
            "agama": ("siswa ini berprestasi di bidang keagamaan dan literasi kitab suci.", "agama islam mtq tilawah tahfidz tafsir nu muhammadiyah"),
            "islam": ("siswa ini berprestasi di bidang keagamaan dan literasi kitab suci.", "agama islam mtq tilawah tahfidz tafsir nu muhammadiyah"),
            "kesehatan": ("siswa ini memiliki kepedulian di bidang kesehatan dan pertolongan medis dasar.", "pmr kesehatan sanitasi pertolongan medis"),
            "pmr": ("siswa ini memiliki kepedulian di bidang kesehatan dan pertolongan medis dasar.", "pmr kesehatan sanitasi pertolongan medis")
        }

        query_lower = query.lower()
        fallback_semantic = "siswa ini memiliki potensi besar untuk mengikuti program akademik berprestasi."
        fallback_keyword = query_lower

        for key, (semantic, keyword) in fallback_dict.items():
            if key in query_lower: 
                fallback_semantic = semantic
                fallback_keyword = f"{query_lower} {keyword}"
                break 

        self.query_cache[query] = (fallback_semantic, fallback_keyword)
        
        return self.query_cache[query]

    def search(self, query, live_programs=None, alpha=0.7, top_k=3, filter_type=None, base_threshold=35.0): 
        print("\n=== AI MATCHING PROCESS TRIGGERED ===")
        semantic_query, keyword_query = self._dynamic_enrich_query(query)
        tokenized_query = keyword_query.split(" ")

        # 1. OPTIMASI IN-MEMORY MERGING & SINGLE-PASS ENCODING
        t0 = time.time()
        live_list = self._get_live_programs(live_programs)
        
        if live_list:
            df_live = pd.DataFrame(live_list).fillna('')
            df_live = df_live[df_live['status'].isin(['active', 'approved', 'ACTIVE', 'APPROVED'])]
            if not df_live.empty:
                df_live['search_content'] = (
                    df_live['title'].astype(str) + " " + 
                    df_live['description'].astype(str)
                ).str.lower()
                
                # Single-pass encode hanya program live baru
                live_embeddings = self.semantic_model.encode(df_live['search_content'].tolist())
                
                # Stack matrix RAM
                df_combined = pd.concat([self.static_df, df_live], ignore_index=True)
                combined_embeddings = np.vstack([self.static_embeddings, live_embeddings])
            else:
                df_combined = self.static_df.copy()
                combined_embeddings = self.static_embeddings
        else:
            df_combined = self.static_df.copy()
            combined_embeddings = self.static_embeddings
            
        print(f"⚡ In-Memory Merging & Encoding Selesai dalam {time.time() - t0:.3f} detik.")

        # 2. STRICT HARD FILTERING (PANDAS BOOLEAN MASKING) SEBELUM COMPUTATION
        if filter_type:
            mask = df_combined['type'].str.lower() == filter_type.lower()
            df_combined = df_combined[mask]
            
            if df_combined.empty:
                return pd.DataFrame(columns=['title', 'type', 'level', 'match_score_percentage', 'description'])
                
            filtered_embeddings = combined_embeddings[mask.values]
        else:
            filtered_embeddings = combined_embeddings

        # Rebuild BM25 secara on-the-fly untuk corpus yang telah difilter (sangat cepat)
        filtered_tokenized = [doc.split(" ") for doc in df_combined['search_content'].tolist()]
        temp_bm25 = BM25Okapi(filtered_tokenized)
        bm25_scores = temp_bm25.get_scores(tokenized_query)

        # 3. LIGHTWEIGHT SEMANTIC SIMILARITY COMPUTATION
        t1 = time.time()
        query_embedding = self.semantic_model.encode([semantic_query])
        semantic_scores = cosine_similarity(query_embedding, filtered_embeddings)[0]

        # 4. HYBRID SCORING & RETURNING
        semantic_scores_norm = np.clip(semantic_scores, 0, 1)
        max_bm25 = np.max(bm25_scores) if len(bm25_scores) > 0 else 0
        if max_bm25 > 0:
            bm25_scores_norm = bm25_scores / max(max_bm25, 10.0) 
        else:
            bm25_scores_norm = bm25_scores

        hybrid_scores = (alpha * semantic_scores_norm) + ((1 - alpha) * bm25_scores_norm)

        df_combined['match_score_raw'] = hybrid_scores
        df_combined['match_score_percentage'] = (hybrid_scores * 100).round(2) 
        
        df_combined = df_combined[df_combined['match_score_percentage'] >= base_threshold]
            
        top_results = df_combined.sort_values(by='match_score_percentage', ascending=False)
        if top_k is not None:
            top_results = top_results.head(top_k)
            
        print(f"🚀 Perhitungan Similarity Cepat Selesai dalam {time.time() - t1:.3f} detik.")
        return top_results[['title', 'type', 'level', 'match_score_percentage', 'description']]

# --- Cara Penggunaan & Pengujian ---
if __name__ == "__main__":
    # Masukkan API Key kamu di sini
    API_KEY = "AIzaSyDzz1MW6DYV5VWzC9e_wYZqX-VSTs0ec0Y"
    
    matcher = ScholarPathMatcher('new_sample_dataset.csv', API_KEY)
    
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
    rekomendasi_lomba = matcher.search(query=user_skill_input, top_k=3, filter_type='competition')
    
    if rekomendasi_lomba.empty:
        print("Tidak ada olimpiade yang cocok/semakna.")
    else:
        for index, row in rekomendasi_lomba.iterrows():
            print(f"[{row['match_score_percentage']}%] {row['title']} ({row['type']} - {row['level']})")
            print(f"Deskripsi: {row['description']}\n")