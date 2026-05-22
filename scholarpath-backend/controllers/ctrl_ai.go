package controllers

import (
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

// Struktur request ke Python
type AIRequest struct {
	UserProfile         string `json:"user_profile"`
	BeasiswaRequirement string `json:"beasiswa_requirement"`
}

// Struktur response dari Python
type AIResponse struct {
	Status     string  `json:"status"`
	MatchScore float64 `json:"match_score"`
	Message    string  `json:"message"`
}

// Struktur untuk hasil akhir yang dikirim ke Frontend
type RecommendationResult struct {
	Beasiswa models.Beasiswa `json:"beasiswa"`
	MatchScore float64       `json:"match_score"`
}

func GetAIRecommendation(c *gin.Context) {
	// 1. Ambil User ID dari Token JWT (berkat middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	// 2. Tarik Profil Siswa dari Database
	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Pastikan profil/keahlian tidak kosong
	if user.Keahlian == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lengkapi profil keahlian Anda terlebih dahulu sebelum mencari rekomendasi."})
		return
	}

	// 3. Tarik Semua Data Beasiswa
	var listBeasiswa []models.Beasiswa
	koneksi.DB.Find(&listBeasiswa)

	var hasilRekomendasi []RecommendationResult

	// 4. Looping & Tembak ke AI Python satu per satu
	for _, beasiswa := range listBeasiswa {
		aiReq := AIRequest{
			UserProfile:         user.Keahlian,
			BeasiswaRequirement: beasiswa.Deskripsi, // Asumsi ada kolom Deskripsi di Beasiswa
		}

		reqBody, _ := json.Marshal(aiReq)
		resp, err := http.Post("http://localhost:8001/api/match", "application/json", bytes.NewBuffer(reqBody))
		
		if err == nil {
			body, _ := io.ReadAll(resp.Body)
			var aiRes AIResponse
			json.Unmarshal(body, &aiRes)
			resp.Body.Close()

			// Simpan hasil ke dalam array
			hasilRekomendasi = append(hasilRekomendasi, RecommendationResult{
				Beasiswa:   beasiswa,
				MatchScore: aiRes.MatchScore,
			})
		}
	}

	// 5. Urutkan dari Skor Kecocokan Tertinggi (Descending)
	sort.Slice(hasilRekomendasi, func(i, j int) bool {
		return hasilRekomendasi[i].MatchScore > hasilRekomendasi[j].MatchScore
	})

	// Kembalikan ke Frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mendapatkan rekomendasi beasiswa",
		"data":    hasilRekomendasi,
	})
}