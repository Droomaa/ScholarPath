package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// 1. CREATE PENDAFTARAN (Dengan Otomatisasi UserID dari JWT)
func CreatePendaftaran(c *gin.Context) {
	var pendaftaran models.Pendaftaran

	// Bind JSON dari frontend ke struct
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil User ID otomatis dari Token JWT (hasil set dari AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login untuk mendaftar"})
		return
	}

	// Masukkan ID yang login ke dalam data pendaftaran
	// PENTING: Pastikan di models/model.go nama variabelnya adalah "UserID"
	pendaftaran.UserID = uint(userID.(float64))

	// Simpan ke database
	if err := koneksi.DB.Create(&pendaftaran).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pendaftaran ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran berhasil disubmit!",
		"data":    pendaftaran,
	})
}

// 2. GET ALL PENDAFTARAN
func GetAllPendaftaran(c *gin.Context) {
	var pendaftarans []models.Pendaftaran
	
	// Opsional: Jika ingin menarik data relasi beasiswa atau usernya, 
	// bisa ditambahkan .Preload("User").Preload("Beasiswa") sebelum .Find()
	koneksi.DB.Find(&pendaftarans)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil semua data pendaftaran",
		"data":    pendaftarans,
	})
}

// 3. GET PENDAFTARAN BY ID
func GetPendaftaranByID(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil detail pendaftaran",
		"data":    pendaftaran,
	})
}

// 4. UPDATE PENDAFTARAN (Biasa digunakan admin instansi untuk mengubah status)
func UpdatePendaftaran(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	
	// Cek apakah data ada
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan"})
		return
	}
	
	// Bind data baru
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Simpan perubahan
	koneksi.DB.Save(&pendaftaran)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Data pendaftaran berhasil diupdate",
		"data":    pendaftaran,
	})
}

// 5. DELETE PENDAFTARAN
func DeletePendaftaran(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	
	// Cek apakah data ada
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan"})
		return
	}
	
	// Hapus data
	koneksi.DB.Delete(&pendaftaran)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Data pendaftaran berhasil dihapus secara permanen",
	})
}