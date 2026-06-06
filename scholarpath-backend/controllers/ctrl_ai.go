package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

func normalizeTitle(title string) string {
	return strings.TrimSpace(title)
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
		beasiswa, ok := index[normalizeTitle(row.Title)]
		if !ok {
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
		olimpiade, ok := index[normalizeTitle(row.Title)]
		if !ok {
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

	if user.Keahlian == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lengkapi profil keahlian Anda terlebih dahulu sebelum mencari rekomendasi."})
		return
	}

	scholarshipRows, scholarshipErr := fetchTopKRecommendations(user.Keahlian, "scholarship", defaultTopK)
	competitionRows, competitionErr := fetchTopKRecommendations(user.Keahlian, "competition", defaultTopK)

	if scholarshipErr != nil && competitionErr != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Layanan AI tidak tersedia"})
		return
	}

	var beasiswaList []models.Beasiswa
	var olimpiadeList []models.Olimpiade
	koneksi.DB.Find(&beasiswaList)
	koneksi.DB.Find(&olimpiadeList)

	response := AIRecommendationResponse{
		Scholarships: []ProgramRecommendation{},
		Competitions: []ProgramRecommendation{},
	}

	if scholarshipErr == nil {
		response.Scholarships = mapScholarshipResults(
			scholarshipRows,
			buildBeasiswaTitleIndex(beasiswaList),
		)
	}

	if competitionErr == nil {
		response.Competitions = mapCompetitionResults(
			competitionRows,
			buildOlimpiadeTitleIndex(olimpiadeList),
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mendapatkan rekomendasi program",
		"data":    response,
	})
}
