package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// Helper internal untuk memastikan yang akses benar-benar ADMIN
func enforceAdminRole(c *gin.Context) (uint, bool) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return 0, false
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return 0, false
	}

	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Fitur ini khusus Admin!"})
		return 0, false
	}

	return userID, true
}

// 1. VERIFY INSTANSI ACCOUNTS
func VerifyInstansi(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	instansiID := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, instansiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data instansi tidak ditemukan"})
		return
	}

	// Ubah status menjadi true
	instansi.IsVerified = true
	koneksi.DB.Save(&instansi)

	c.JSON(http.StatusOK, gin.H{"message": "Akun Instansi berhasil diverifikasi", "data": instansi})
}

// 2. VERIFY OLIMPIADE
func VerifyOlimpiade(c *gin.Context) {
	adminID, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	olimpiadeID := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, olimpiadeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data Olimpiade tidak ditemukan"})
		return
	}

	// Isi kolom VerifiedBy dengan ID Admin yang sedang login
	olimpiade.VerifiedBy = &adminID
	koneksi.DB.Save(&olimpiade)

	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil diverifikasi oleh Admin", "data": olimpiade})
}

// 3. VERIFY BEASISWA
func VerifyBeasiswa(c *gin.Context) {
	adminID, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	beasiswaID := c.Param("id")
	var beasiswa models.Beasiswa
	if err := koneksi.DB.First(&beasiswa, beasiswaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data Beasiswa tidak ditemukan"})
		return
	}

	beasiswa.VerifiedBy = &adminID
	koneksi.DB.Save(&beasiswa)

	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil diverifikasi oleh Admin", "data": beasiswa})
}

// 4. SEND NOTIFICATION (Admin ke User/Instansi)
func CreateNotification(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var notif models.Notification
	if err := c.ShouldBindJSON(&notif); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validasi apakah user penerima itu ada
	var targetUser models.User
	if err := koneksi.DB.First(&targetUser, notif.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User penerima tidak ditemukan di database"})
		return
	}

	koneksi.DB.Create(&notif)
	c.JSON(http.StatusCreated, gin.H{"message": "Notifikasi berhasil dikirim", "data": notif})
}

// 5. GET MY NOTIFICATIONS (Untuk Siswa/Instansi melihat pesan masuk)
func GetMyNotifications(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var notifs []models.Notification
	// Ambil notifikasi milik user ini, urutkan dari yang paling baru
	koneksi.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&notifs)

	c.JSON(http.StatusOK, gin.H{"data": notifs})
}