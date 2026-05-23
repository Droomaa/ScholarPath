package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// Helper untuk mengambil ID dari token apa pun penamaan kuncinya di middleware
func getUserIDFromContext(c *gin.Context) (uint, bool) {
	// Cek berbagai kemungkinan nama key yang sering diset oleh JWT Middleware
	keys := []string{"user_id", "userID", "id", "userId", "User_ID"}
	for _, key := range keys {
		if val, exists := c.Get(key); exists {
			// JWT biasanya mengubah angka menjadi float64 saat di-decode
			if idFloat, ok := val.(float64); ok {
				return uint(idFloat), true
			}
			// Jaga-jaga jika middleware menyimpannya langsung sebagai string/int/uint
			if idUint, ok := val.(uint); ok {
				return idUint, true
			}
			if idInt, ok := val.(int); ok {
				return uint(idInt), true
			}
		}
	}
	return 0, false
}

// UPDATE PROFILE SISWA
func UpdateProfile(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login (Gagal membaca ID dari token)"})
		return
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	var input struct {
		Name      string `json:"name"`
		JenjangID *uint  `json:"jenjang_id"`
		Keahlian  string `json:"keahlian"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	if input.JenjangID != nil {
		user.JenjangID = input.JenjangID
	}
	if input.Keahlian != "" {
		user.Keahlian = input.Keahlian
	}

	koneksi.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"data":    user,
	})
}

// GET PROFILE SENDIRI
func GetMyProfile(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login (Gagal membaca ID dari token)"})
		return
	}

	var user models.User

	// Menggunakan raw query untuk bypass semua magic GORM
	err := koneksi.DB.Table("users").Where("id = ?", userID).Scan(&user).Error
	
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan: " + err.Error()})
		return
	}
	
	// Validasi tambahan jika raw query sukses jalan tapi datanya kosong (ID 0)
	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ada di database"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": user})
}