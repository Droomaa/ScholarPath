from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# IMPORT KELAS CANGGIH BUATANMU DARI ai_matcher_fix.py
from ai_matcher_fix import ScholarPathMatcher

app = FastAPI()

print("⏳ Sedang memuat Dataset, BM25, dan Model NLP dari ai_matcher_fix (Tunggu sebentar)...")
# Inisialisasi model buatanmu di luar fungsi agar HANYA DILOAD SEKALI saat server menyala.
API_KEY = "AIzaSyDzz1MW6DYV5VWzC9e_wYZqX-VSTs0ec0Y" 
matcher = ScholarPathMatcher('new_sample_dataset.csv', API_KEY)
print("✅ Mesin AI Hybrid (BM25 + Semantic + Gemini) Siap Tempur!")

# Struktur data input yang akan dikirim oleh Golang
class MatchRequest(BaseModel):
    user_skill: str
    filter_type: str = None  # 'scholarship' atau 'competition'
    top_k: int = 3

@app.post("/api/match")
def calculate_match(data: MatchRequest):
    try:
        # PANGGIL FUNGSI SEARCH() MILIKMU SENDIRI DI SINI!
        results_df = matcher.search(
            query=data.user_skill,
            top_k=data.top_k,
            filter_type=data.filter_type
        )
        
        # FastAPI tidak bisa mengembalikan Pandas DataFrame secara langsung.
        # Kita harus mengubahnya menjadi Dictionary / JSON.
        results_list = results_df.to_dict(orient="records")
        
        return {
            "status": "success",
            "data": results_list,
            "message": "Rekomendasi berhasil digenerate oleh AI Canggih!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses AI: {str(e)}")

# Endpoint untuk cek status server AI
@app.get("/")
def health_check():
    return {"status": "AI Microservice is running smoothly with ai_matcher_fix!"}