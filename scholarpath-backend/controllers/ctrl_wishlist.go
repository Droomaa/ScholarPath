package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// Struct custom agar balikan JSON ke Frontend lebih informatif (ada judulnya)
type WishlistItem struct {
	WishlistID   uint   `json:"wishlist_id"`
	ProgramType  string `json:"program_type"`
	ProgramTitle string `json:"program_title"`
	ProgramID    uint   `json:"program_id"`
}

// 1. TAMBAH KE WISHLIST
func AddToWishlist(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var input models.Wishlist
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.UserID = userID

	// Validasi: Harus pilih salah satu
	if input.BeasiswaID == nil && input.OlimpiadeID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Harus menyertakan beasiswa_id atau olimpiade_id"})
		return
	}

	// Mencegah Duplikasi (Supaya user tidak bisa nyimpan lomba yang sama 2 kali)
	var existing models.Wishlist
	query := koneksi.DB.Where("user_id = ?", userID)
	if input.BeasiswaID != nil {
		query = query.Where("beasiswa_id = ?", input.BeasiswaID)
	} else {
		query = query.Where("olimpiade_id = ?", input.OlimpiadeID)
	}

	if err := query.First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Program ini sudah ada di wishlist Anda!"})
		return
	}

	// Simpan ke database
	koneksi.DB.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"message": "Berhasil disimpan ke wishlist", "data": input})
}

// 2. LIHAT WISHLIST SAYA
func GetMyWishlist(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var myWishlist []WishlistItem

	// Menggunakan RAW SQL untuk mengambil nama judul dari Beasiswa/Olimpiade
	query := `
		SELECT 
			w.id as wishlist_id,
			CASE WHEN w.beasiswa_id IS NOT NULL THEN 'Beasiswa' ELSE 'Olimpiade' END as program_type,
			COALESCE(b.nama, o.judul) as program_title,
			COALESCE(w.beasiswa_id, w.olimpiade_id) as program_id
		FROM wishlists w
		LEFT JOIN beasiswas b ON w.beasiswa_id = b.id
		LEFT JOIN olimpiades o ON w.olimpiade_id = o.id
		WHERE w.user_id = ?
		ORDER BY w.created_at DESC
	`

	if err := koneksi.DB.Raw(query, userID).Scan(&myWishlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data wishlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": myWishlist})
}

// 3. HAPUS DARI WISHLIST
func DeleteWishlist(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	wishlistID := c.Param("id")
	var wishlist models.Wishlist

	if err := koneksi.DB.First(&wishlist, wishlistID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data wishlist tidak ditemukan"})
		return
	}

	// Proteksi: Pastikan user hanya bisa menghapus wishlist miliknya sendiri
	if wishlist.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Ini bukan wishlist Anda"})
		return
	}

	koneksi.DB.Delete(&wishlist)
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil dihapus dari wishlist"})
}