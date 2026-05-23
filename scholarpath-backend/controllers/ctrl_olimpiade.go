package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// Helper internal untuk mengecek otorisasi (Siapa dia dan apa role-nya?)
func checkUserAuthorization(c *gin.Context) (models.User, *models.Instansi, bool) {
	userID, exists := getUserIDFromContext(c)
	var user models.User
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return user, nil, false
	}

	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return user, nil, false
	}

	// Jika dia instansi, tarik juga data profil instansinya untuk dicocokkan nanti
	var instansi models.Instansi
	if user.Role == "instansi" {
		if err := koneksi.DB.Where("user_id = ?", user.ID).First(&instansi).Error; err == nil {
			return user, &instansi, true
		}
		// Jika rolenya instansi tapi profil instansinya belum dibuat
		return user, nil, true 
	}

	return user, nil, true
}

// CREATE OLIMPIADE
func CreateOlimpiade(c *gin.Context) {
	user, instansi, ok := checkUserAuthorization(c)
	if !ok { return }

	// 1. Blokir Siswa
	if user.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Siswa tidak diizinkan menambah data olimpiade"})
		return
	}

	var olimpiade models.Olimpiade
	if err := c.ShouldBindJSON(&olimpiade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Proteksi Instansi (Kunci ID otomatis agar tidak bisa manipulasi)
	if user.Role == "instansi" {
		if instansi == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Anda harus melengkapi profil instansi terlebih dahulu"})
			return
		}
		olimpiade.InstansiID = &instansi.ID
	}

	koneksi.DB.Create(&olimpiade)
	c.JSON(http.StatusCreated, gin.H{"message": "Olimpiade berhasil dibuat", "data": olimpiade})
}

// GET ALL OLIMPIADE (Terbuka untuk semua yang sudah login, termasuk Siswa)
func GetAllOlimpiade(c *gin.Context) {
	var olimpiades []models.Olimpiade
	koneksi.DB.Find(&olimpiades)
	c.JSON(http.StatusOK, gin.H{"data": olimpiades})
}

// GET OLIMPIADE BY ID (Terbuka untuk semua)
func GetOlimpiadeByID(c *gin.Context) {
	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": olimpiade})
}

// UPDATE OLIMPIADE
func UpdateOlimpiade(c *gin.Context) {
	user, instansi, ok := checkUserAuthorization(c)
	if !ok { return }

	// 1. Blokir Siswa
	if user.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Siswa tidak diizinkan mengubah data"})
		return
	}

	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}

	// 2. PROTEKSI KEPEMILIKAN UNTUK INSTANSI
	if user.Role == "instansi" {
		// Kalau olimpiade ini buatan admin (InstansiID nil) atau buatan instansi lain (ID tidak cocok)
		if instansi == nil || olimpiade.InstansiID == nil || *olimpiade.InstansiID != instansi.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda hanya dapat mengubah olimpiade yang Anda tambahkan sendiri!"})
			return
		}
	}

	var input models.Olimpiade
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Pastikan user instansi tidak "membuang" InstansiID mereka saat mengupdate data
	if user.Role == "instansi" {
		input.InstansiID = olimpiade.InstansiID
	}

	// Update data menggunakan map agar lebih dinamis
	koneksi.DB.Model(&olimpiade).Updates(input)
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil diupdate", "data": olimpiade})
}

// DELETE OLIMPIADE
func DeleteOlimpiade(c *gin.Context) {
	user, instansi, ok := checkUserAuthorization(c)
	if !ok { return }

	// 1. Blokir Siswa
	if user.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Siswa tidak diizinkan menghapus data"})
		return
	}

	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}

	// 2. PROTEKSI KEPEMILIKAN UNTUK INSTANSI
	if user.Role == "instansi" {
		if instansi == nil || olimpiade.InstansiID == nil || *olimpiade.InstansiID != instansi.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda hanya dapat menghapus olimpiade yang Anda tambahkan sendiri!"})
			return
		}
	}

	koneksi.DB.Delete(&olimpiade)
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil dihapus"})
}