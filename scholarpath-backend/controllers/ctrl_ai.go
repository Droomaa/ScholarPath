package controllers

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

const (
	aiServiceURL = "http://localhost:8001/api/match"
	defaultTopK  = 5
)

type aiTopKRequest struct {
	UserProfile string `json:"user_profile"`
	TopK        int    `json:"top_k"`
	FilterType  string `json:"filter_type"`
}

type aiTopKResponse struct {
	Status  string         `json:"status"`
	Data    []aiTopKResult `json:"data"`
	Message string         `json:"message"`
}

type aiTopKResult struct {
	Title                string  `json:"title"`
	Type                 string  `json:"type"`
	Level                string  `json:"level"`
	MatchScorePercentage float64 `json:"match_score_percentage"`
	Description          string  `json:"description"`
}

type AIRecommendationResponse struct {
	Scholarships []ProgramRecommendation `json:"scholarships"`
	Competitions []ProgramRecommendation `json:"competitions"`
}

type ProgramRecommendation struct {
	ProgramID  string            `json:"program_id"`
	Category   string            `json:"category"`
	Title      string            `json:"title"`
	MatchScore float64           `json:"match_score"`
	Beasiswa   *models.Beasiswa  `json:"beasiswa,omitempty"`
	Olimpiade  *models.Olimpiade `json:"olimpiade,omitempty"`
}

// Fungsi ini dipanggil setiap kali Instansi nge-SAVE, UPDATE, atau DELETE lomba/beasiswa
func SyncDatabaseToCSV() {
	// ⚠️ PENTING: Ganti path ini ke lokasi asli file CSV Python kalian berada!
	csvFilePath := "../scholarpath-ai/new_sample_dataset.csv"

	file, err := os.Create(csvFilePath)
	if err != nil {
		log.Println("Gagal membuat/menimpa CSV:", err)
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// 1. TULIS HEADER CSV (Kecil semua sesuai standar Pandas Python)
	writer.Write([]string{"title", "description", "type", "level"})

	// 2. AMBIL DAN TULIS SEMUA DATA BEASISWA
	var beasiswaList []models.Beasiswa
	koneksi.DB.Find(&beasiswaList)
	for _, b := range beasiswaList {
		// Tambahkan "Nasional" agar kolom level terisi dan format seragam
		writer.Write([]string{b.Nama, b.Deskripsi, "scholarship", "Nasional"})
	}

	// 3. AMBIL DAN TULIS SEMUA DATA OLIMPIADE
	var olimpiadeList []models.Olimpiade
	koneksi.DB.Find(&olimpiadeList)
	for _, o := range olimpiadeList {
		// Tambahkan "Nasional" agar kolom level terisi dan format seragam
		writer.Write([]string{o.Judul, o.Deskripsi, "competition", "Nasional"})
	}

	log.Println("✅ Berhasil menimpa CSV dengan data terbaru dari Database!")

	// 4. TEMBAK API PYTHON UNTUK REFRESH RAM
	_, err = http.Post("http://localhost:8001/api/reload-csv", "application/json", nil)
	if err == nil {
		log.Println("✅ Berhasil menyuruh Python me-restart otak AI-nya!")
	}
}

func normalizeTitle(title string) string {
	// PENTING: Ubah teks menjadi huruf kecil semua DAN potong spasi berlebih
	return strings.ToLower(strings.TrimSpace(title))
}

func fetchTopKRecommendations(userProfile, filterType string, topK int) ([]aiTopKResult, error) {

	reqBody, err := json.Marshal(aiTopKRequest{
		UserProfile: userProfile,
		TopK:        topK,
		FilterType:  filterType,
	})
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(aiServiceURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// ---> CCTV DEBUGGING: Memantau data mentah dari Python <---
	fmt.Println("🚨 BALASAN DARI PYTHON:", string(body))

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("python ai returned status %d: %s", resp.StatusCode, string(body))
	}

	var aiRes aiTopKResponse
	if err := json.Unmarshal(body, &aiRes); err != nil {
		return nil, err
	}

	if aiRes.Status != "success" {
		return nil, fmt.Errorf("python ai status %q: %s", aiRes.Status, aiRes.Message)
	}

	return aiRes.Data, nil
}

func buildBeasiswaTitleIndex(list []models.Beasiswa) map[string]models.Beasiswa {
	index := make(map[string]models.Beasiswa, len(list))
	for _, item := range list {
		key := normalizeTitle(item.Nama)
		if key == "" {
			continue
		}
		index[key] = item
	}
	return index
}

func buildOlimpiadeTitleIndex(list []models.Olimpiade) map[string]models.Olimpiade {
	index := make(map[string]models.Olimpiade, len(list))
	for _, item := range list {
		key := normalizeTitle(item.Judul)
		if key == "" {
			continue
		}
		index[key] = item
	}
	return index
}

func mapScholarshipResults(rows []aiTopKResult, index map[string]models.Beasiswa) []ProgramRecommendation {
	results := make([]ProgramRecommendation, 0, len(rows))
	for _, row := range rows {
		// Gunakan normalizeTitle agar pencocokan judul kebal huruf besar/kecil
		beasiswa, ok := index[normalizeTitle(row.Title)]
		if !ok {
			// JAGA-JAGA: Jika di DB ditulisnya lowercase/berbeda, kita log untuk debug
			fmt.Println("⚠️ Beasiswa dari Python dilewati karena tidak ada di DB:", row.Title)
			continue 
		}
		record := beasiswa
		results = append(results, ProgramRecommendation{
			ProgramID:  fmt.Sprintf("beasiswa-%d", beasiswa.ID),
			Category:   "beasiswa",
			Title:      beasiswa.Nama,
			MatchScore: row.MatchScorePercentage,
			Beasiswa:   &record,
		})
	}
	return results
}

func mapCompetitionResults(rows []aiTopKResult, index map[string]models.Olimpiade) []ProgramRecommendation {
	results := make([]ProgramRecommendation, 0, len(rows))
	for _, row := range rows {
		// Gunakan normalizeTitle agar pencocokan judul kebal huruf besar/kecil
		olimpiade, ok := index[normalizeTitle(row.Title)]
		if !ok {
			fmt.Println("⚠️ Olimpiade dari Python dilewati karena tidak ada di DB:", row.Title)
			continue 
		}
		record := olimpiade
		results = append(results, ProgramRecommendation{
			ProgramID:  fmt.Sprintf("olimpiade-%d", olimpiade.ID),
			Category:   "kompetisi",
			Title:      olimpiade.Judul,
			MatchScore: row.MatchScorePercentage,
			Olimpiade:  &record,
		})
	}
	return results
}

func GetAIRecommendation(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// 1. TANGKAP INPUTAN DARI LAYAR FRONTEND (URL Query)
	inputSkill := c.Query("skill")
	filterType := c.Query("type") // "scholarship", "competition", atau kosong

	// 2. FALLBACK: Kalau Frontend gak ngisi skill di layar, baru ambil dari DB Profil
	skillToUse := inputSkill
	if skillToUse == "" {
		skillToUse = user.Keahlian
	}

	// Kalau DB kosong dan Frontend juga kosong, tolak!
	if skillToUse == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ketikkan skill Anda di kolom pencarian, atau lengkapi profil terlebih dahulu."})
		return
	}

	// Siapkan penampung hasil
	response := AIRecommendationResponse{
		Scholarships: []ProgramRecommendation{},
		Competitions: []ProgramRecommendation{},
	}

	var beasiswaList []models.Beasiswa
	var olimpiadeList []models.Olimpiade

	// 3. PENCARIAN DINAMIS (Berdasarkan filterType dari Frontend)
	// Jika Frontend minta "scholarship" atau tidak ngirim filter sama sekali
	if filterType == "" || filterType == "scholarship" {
		scholarshipRows, err := fetchTopKRecommendations(skillToUse, "scholarship", defaultTopK)
		if err == nil {
			koneksi.DB.Find(&beasiswaList)
			response.Scholarships = mapScholarshipResults(scholarshipRows, buildBeasiswaTitleIndex(beasiswaList))
		}
	}

	// Jika Frontend minta "competition" atau tidak ngirim filter sama sekali
	if filterType == "" || filterType == "competition" {
		competitionRows, err := fetchTopKRecommendations(skillToUse, "competition", defaultTopK)
		if err == nil {
			koneksi.DB.Find(&olimpiadeList)
			response.Competitions = mapCompetitionResults(competitionRows, buildOlimpiadeTitleIndex(olimpiadeList))
		}
	}

	// 4. KEMBALIKAN KE FRONTEND
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mendapatkan rekomendasi program",
		"data":    response,
	})
}