package controllers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Struktur data yang diterima dari Frontend
type RecommendationRequest struct {
	UserProfile         string `json:"user_profile" binding:"required"`
	BeasiswaRequirement string `json:"beasiswa_requirement" binding:"required"`
}

// Struktur data yang diterima dari Python AI
type AIResponse struct {
	Status     string  `json:"status"`
	MatchScore float64 `json:"match_score"`
	Message    string  `json:"message"`
}

func GetAIRecommendation(c *gin.Context) {
	var input RecommendationRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data profil atau syarat beasiswa tidak valid"})
		return
	}

	// 1. Ubah data menjadi JSON untuk dikirim ke Python
	requestBody, err := json.Marshal(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data untuk AI"})
		return
	}

	// 2. Tembak endpoint FastAPI Python (Port 8001)
	resp, err := http.Post("http://localhost:8001/api/match", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		// Jika Python mati, akan masuk ke sini
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI Engine sedang offline atau tidak dapat dijangkau"})
		return
	}
	defer resp.Body.Close()

	// 3. Baca balasan dari Python
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca respons dari AI Engine"})
		return
	}

	// 4. Ubah JSON dari Python menjadi struct Golang
	var aiResult AIResponse
	if err := json.Unmarshal(body, &aiResult); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format respons AI Engine tidak sesuai"})
		return
	}

	// 5. Kembalikan hasil akhirnya ke Frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Kalkulasi kecocokan berhasil",
		"data": gin.H{
			"user_profile":         input.UserProfile,
			"beasiswa_requirement": input.BeasiswaRequirement,
			"ai_match_score":       aiResult.MatchScore,
			"ai_message":           aiResult.Message,
		},
	})
}