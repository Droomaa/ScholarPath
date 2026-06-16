package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAllInstansi(c *gin.Context) {
	var instansis []models.Instansi
	koneksi.DB.Find(&instansis)
	c.JSON(http.StatusOK, gin.H{"data": instansis})
}

func GetInstansiByID(c *gin.Context) {
	id := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

// GetMyInstansi — Mengambil profil instansi berdasarkan user_id dari JWT token
// Route: GET /api/instansi/me
func GetMyInstansi(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var instansi models.Instansi
	if err := koneksi.DB.Where("user_id = ?", userID).First(&instansi).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profil instansi belum dibuat untuk akun ini"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

// UploadVerificationDocs — Upload kedua dokumen verifikasi instansi sekaligus
// Route: POST /api/instansi/upload-docs (protected, instansi only)
func UploadVerificationDocs(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	// Cari instansi berdasarkan user_id dari token — tidak perlu tahu instansi_id di frontend
	var instansi models.Instansi
	if err := koneksi.DB.Where("user_id = ?", userID).First(&instansi).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Profil instansi tidak ditemukan untuk user_id=%d. Pastikan akun terdaftar sebagai instansi.", userID)})
		return
	}

	backupSK := instansi.SKDocument
	backupLegal := instansi.LegalDocument

	// === Upload SK Izin (key: sk_document) ===
	skFile, err := c.FormFile("sk_document")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File SK Izin (sk_document) tidak ditemukan dalam request"})
		return
	}
	skExt := filepath.Ext(skFile.Filename)
	skNewName := fmt.Sprintf("sk_%d_%d%s", userID, time.Now().Unix(), skExt)
	skSavePath := filepath.Join("storage", "uploads", skNewName)
	if err := c.SaveUploadedFile(skFile, skSavePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file SK Izin: " + err.Error()})
		return
	}

	// === Upload Dokumen Legalitas (key: legal_document) ===
	legalFile, err := c.FormFile("legal_document")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File Legalitas (legal_document) tidak ditemukan dalam request"})
		return
	}
	legalExt := filepath.Ext(legalFile.Filename)
	legalNewName := fmt.Sprintf("legal_%d_%d%s", userID, time.Now().Unix(), legalExt)
	legalSavePath := filepath.Join("storage", "uploads", legalNewName)
	if err := c.SaveUploadedFile(legalFile, legalSavePath); err != nil {
		// Rollback: field SK tetap yang lama
		instansi.SKDocument = backupSK
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file Legalitas: " + err.Error()})
		return
	}

	// === Simpan nama file ke database via GORM Update ===
	result := koneksi.DB.Model(&instansi).Updates(map[string]interface{}{
		"sk_document":    skNewName,
		"legal_document": legalNewName,
		"status":         "pending", // Tandai sedang menunggu review admin
	})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data dokumen: " + result.Error.Error()})
		return
	}
	// Jika rollback diperlukan karena alasan teknis
	_ = backupLegal

	c.JSON(http.StatusOK, gin.H{
		"message":        "Dokumen verifikasi berhasil diunggah dan sedang ditinjau oleh Admin",
		"sk_document":    skNewName,
		"legal_document": legalNewName,
		"instansi_id":    instansi.ID,
	})
}

// UpdateInstansi — Update data umum instansi (admin / instansi sendiri)
func UpdateInstansi(c *gin.Context) {
	id := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}

	var input struct {
		Nama          string `json:"nama"`
		Alamat        string `json:"alamat"`
		Kontak        string `json:"kontak"`
		SKDocument    string `json:"sk_document"`
		LegalDocument string `json:"legal_document"`
		Status        string `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Patch hanya field yang terisi
	updates := map[string]interface{}{}
	if input.Nama != "" {
		updates["nama"] = input.Nama
	}
	if input.Alamat != "" {
		updates["alamat"] = input.Alamat
	}
	if input.Kontak != "" {
		updates["kontak"] = input.Kontak
	}
	if input.SKDocument != "" {
		updates["sk_document"] = input.SKDocument
	}
	if input.LegalDocument != "" {
		updates["legal_document"] = input.LegalDocument
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}

	koneksi.DB.Model(&instansi).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"message": "Data instansi diupdate", "data": instansi})
}