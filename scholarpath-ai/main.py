from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
# Import kelas canggih dari ai_matcher_fix.py
from ai_matcher_fix import ScholarPathMatcher

app = FastAPI()

print("⏳ Sedang memuat Dataset, BM25, dan Model NLP dari ai_matcher_fix... (Tunggu sebentar)")
API_KEY = "AIzaSyDzz1MW6DYV5VWzC9e_wYZqX-VSTs0ec0Y" 
matcher = ScholarPathMatcher('new_sample_dataset.csv', API_KEY)
print("✅ Mesin AI Hybrid Siap Tempur dengan Fitur Backward Compatibility!")

# Pydantic Model yang dibuat opsional (None) agar kebal dari Error 422
class MatchRequest(BaseModel):
    user_skill: str = None
    user_profile: str = None            # Ditambahkan agar kompatibel dengan Golang lama
    beasiswa_requirement: str = None    # Ditambahkan agar kompatibel dengan Golang lama
    filter_type: str = None
    top_k: int = 3

@app.post("/api/match")
def calculate_match(data: MatchRequest):
    try:
        # =====================================================================
        # SKENARIO A: GOLANG LAMA (Mengirim user_profile DAN beasiswa_requirement)
        # =====================================================================
        if data.beasiswa_requirement and (data.user_profile or data.user_skill):
            query_text = data.user_profile if data.user_profile else data.user_skill
            
            # Gunakan semantic_model bawaan matcher agar hemat RAM & super cepat
            embeddings1 = matcher.semantic_model.encode([query_text])
            embeddings2 = matcher.semantic_model.encode([data.beasiswa_requirement])
            
            score = cosine_similarity(embeddings1, embeddings2)[0][0]
            score_percentage = round(float(score) * 100, 2)
            
            if score_percentage < 0:
                score_percentage = 0.0
                
            return {
                "status": "success",
                "match_score": score_percentage,
                "message": "Kalkulasi skor tunggal berhasil (Mode Kompatibilitas Golang)"
            }

        # =====================================================================
        # SKENARIO B: GOLANG BARU / FRONTEND DIRECT (Mencari Top K dari CSV)
        # =====================================================================
        query_text = data.user_skill if data.user_skill else data.user_profile
        if not query_text:
            raise HTTPException(status_code=400, detail="JSON tidak lengkap. Kirim 'user_skill' atau 'user_profile'")
            
        results_df = matcher.search(
            query=query_text,
            top_k=data.top_k,
            filter_type=data.filter_type
        )
        
        results_list = results_df.to_dict(orient="records")
        
        return {
            "status": "success",
            "data": results_list,
            "message": "Rekomendasi sukses digenerate dari Dataset CSV!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses AI: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "AI Microservice is running smoothly"}