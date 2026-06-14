package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

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

// Opsional untuk admin / instansi itu sendiri
func UpdateInstansi(c *gin.Context) {
	id := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&instansi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&instansi)
	c.JSON(http.StatusOK, gin.H{"message": "Data instansi diupdate", "data": instansi})
}

// GET PROFILE INSTANSI SENDIRI
func GetMyInstansiProfile(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login (Gagal membaca ID dari token)"})
		return
	}

	var instansi models.Instansi
	if err := koneksi.DB.Where("user_id = ?", userID).First(&instansi).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profil Instansi tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

// UPDATE PROFILE INSTANSI SENDIRI
func UpdateMyInstansiProfile(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login (Gagal membaca ID dari token)"})
		return
	}

	var instansi models.Instansi
	if err := koneksi.DB.Where("user_id = ?", userID).First(&instansi).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profil Instansi tidak ditemukan"})
		return
	}

	var input struct {
		Nama   string `json:"nama"`
		Alamat string `json:"alamat"`
		Kontak string `json:"kontak"` // Will contain JSON string of contact details & description
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Nama != "" {
		instansi.Nama = input.Nama
	}
	if input.Alamat != "" {
		instansi.Alamat = input.Alamat
	}
	// Kontak will replace completely if provided
	if input.Kontak != "" {
		instansi.Kontak = input.Kontak
	}

	koneksi.DB.Save(&instansi)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil Instansi berhasil diperbarui",
		"data":    instansi,
	})
}