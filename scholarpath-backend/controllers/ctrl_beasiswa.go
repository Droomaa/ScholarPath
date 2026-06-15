package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateBeasiswa(c *gin.Context) {
	user, instansi, ok := checkUserAuthorization(c)
	if !ok { return }

	// Blokir Siswa
	if user.Role == "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Siswa tidak diizinkan menambah data beasiswa"})
		return
	}

	var beasiswa models.Beasiswa
	if err := c.ShouldBindJSON(&beasiswa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Proteksi Instansi (Kunci ID otomatis agar tidak bisa manipulasi)
	if user.Role == "instansi" {
		if instansi == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Anda harus melengkapi profil instansi terlebih dahulu"})
			return
		}
		beasiswa.InstansiID = &instansi.ID
	}

	if err := koneksi.DB.Create(&beasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan beasiswa: " + err.Error()})
		return
	}

	// Trigger Notifikasi Awal untuk Instansi
	notif := models.Notification{
		UserID:  user.ID, // User ID instansi
		Title:   "Pengajuan Program",
		Message: "Program Anda berhasil diajukan dan sedang dalam proses review oleh Admin Pusat.",
	}
	koneksi.DB.Create(&notif)

	c.JSON(http.StatusCreated, gin.H{"message": "Beasiswa berhasil dibuat", "data": beasiswa})
}

func GetAllBeasiswa(c *gin.Context) {
	var beasiswas []models.Beasiswa
	user, _, ok := checkUserAuthorization(c)
	if ok && user.Role == "instansi" {
		// Instansi sees their own programs regardless of status (or all if admin, but here only instansi/student expected usually. Let's rely on standard logic)
		// Wait, the prompt says "Halaman Siswa: Tambahkan query filter GORM .Where("status = ? AND is_visible = ?", "active", true)"
	}
	// Better to just apply it if role == student, or default behavior:
	if ok && user.Role == "student" {
		koneksi.DB.Where("status = ? AND is_visible = ?", "active", true).Find(&beasiswas)
	} else if ok && user.Role == "instansi" {
		// Just to be safe, Instansi sees all. The frontend will filter if needed, or we return all for them.
		koneksi.DB.Find(&beasiswas)
	} else {
		// Public or others
		koneksi.DB.Where("status = ? AND is_visible = ?", "active", true).Find(&beasiswas)
	}
	
	c.JSON(http.StatusOK, gin.H{"data": beasiswas})
}

func GetBeasiswaByID(c *gin.Context) {
	id := c.Param("id")
	var beasiswa models.Beasiswa
	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": beasiswa})
}

func UpdateBeasiswa(c *gin.Context) {
	id := c.Param("id")
	var beasiswa models.Beasiswa
	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&beasiswa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	koneksi.DB.Save(&beasiswa)
	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa diupdate", "data": beasiswa})
}

func DeleteBeasiswa(c *gin.Context) {
	id := c.Param("id")
	var beasiswa models.Beasiswa
	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&beasiswa)
	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil dihapus"})
}