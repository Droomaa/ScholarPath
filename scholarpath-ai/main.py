from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Memuat model di luar fungsi agar HANYA DILOAD SEKALI saat server menyala.
# Ini mencegah server RAM bocor (memory leak) dan membuat response API sangat cepat.
print("⏳ Mengunduh/Memuat model NLP Multilingual (Tunggu sebentar)...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print("✅ Model AI Siap Tempur!")

# Struktur data yang diharapkan datang dari Golang
class MatchRequest(BaseModel):
    user_profile: str
    beasiswa_requirement: str

@app.post("/api/match")
def calculate_match(data: MatchRequest):
    try:
        # 1. Text Embedding: Ubah kalimat menjadi deretan angka matematika (Vektor)
        embeddings1 = model.encode([data.user_profile])
        embeddings2 = model.encode([data.beasiswa_requirement])
        
        # 2. Cosine Similarity: Hitung kedekatan sudut antara dua vektor teks tersebut
        score = cosine_similarity(embeddings1, embeddings2)[0][0]
        
        # 3. Konversi ke persentase (0 - 100)
        score_percentage = round(float(score) * 100, 2)
        
        # Cegah nilai minus jika teks benar-benar sangat bertolak belakang
        if score_percentage < 0:
            score_percentage = 0.0
            
        return {
            "status": "success",
            "match_score": score_percentage,
            "message": "Kalkulasi NLP berhasil dieksekusi"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses AI: {str(e)}")

# Endpoint untuk cek status server AI
@app.get("/")
def health_check():
    return {"status": "AI Microservice is running smoothly"}