package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

type RiwayatPendaftaran struct {
	PendaftaranID uint      `json:"pendaftaran_id"`
	ProgramType   string    `json:"program_type"`
	ProgramTitle  string    `json:"program_title"`
	StatusName    string    `json:"status_name"`
	TanggalDaftar time.Time `json:"tanggal_daftar"`
}
type ApplicantDetail struct {
	PendaftaranID uint      `json:"pendaftaran_id"`
	StudentID     uint      `json:"student_id"`
	StudentName   string    `json:"student_name"`
	StudentEmail  string    `json:"student_email"`
	Keahlian      string    `json:"keahlian"`
	ProgramType   string    `json:"program_type"` // "Beasiswa" ATAU "Olimpiade"
	ProgramTitle  string    `json:"program_title"`
	StatusID      *uint     `json:"status_id"`
	TanggalDaftar time.Time `json:"tanggal_daftar"`
}
// CREATE PENDAFTARAN
func CreatePendaftaran(c *gin.Context) {
	// 1. Ganti c.Get yang berbahaya dengan helper sakti kita
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var pendaftaran models.Pendaftaran
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Masukkan userID yang sudah di-parsing dengan aman
	pendaftaran.UserID = userID

	// Set tanggal daftar otomatis ke waktu sekarang jika belum ada
	if pendaftaran.TanggalDaftar.IsZero() {
		pendaftaran.TanggalDaftar = time.Now()
	}

	// Simpan ke database
	if err := koneksi.DB.Create(&pendaftaran).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran berhasil dibuat",
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

func GetInstansiApplicants(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	// Tarik data user untuk memastikan role
	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Proteksi: Hanya Instansi dan Admin yang boleh melihat daftar ini
	if user.Role != "instansi" && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Hanya instansi atau admin yang dapat melihat pendaftar"})
		return
	}

	var applicants []ApplicantDetail
	var err error

	if user.Role == "instansi" {
		// Cari ID instansi berdasarkan user_id token
		var instansi models.Instansi
		if err := koneksi.DB.Where("user_id = ?", user.ID).First(&instansi).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Profil instansi Anda belum lengkap"})
			return
		}

		// Query sakti menggunakan RAW SQL Join untuk menarik data pendaftar khusus milik instansi ini
		query := `
			SELECT 
				p.id as pendaftaran_id, u.id as student_id, u.name as student_name, u.email as student_email, u.keahlian,
				CASE WHEN p.beasiswa_id IS NOT NULL THEN 'Beasiswa' ELSE 'Olimpiade' END as program_type,
				COALESCE(b.nama, o.judul) as program_title,
				p.status_id, p.tanggal_daftar
			FROM pendaftarans p
			JOIN users u ON p.user_id = u.id
			LEFT JOIN beasiswas b ON p.beasiswa_id = b.id
			LEFT JOIN olimpiades o ON p.olimpiade_id = o.id
			WHERE b.instansi_id = ? OR o.instansi_id = ?
		`
		err = koneksi.DB.Raw(query, instansi.ID, instansi.ID).Scan(&applicants).Error
	} else {
		// Jika Admin, tampilkan SELURUH pendaftar dari semua instansi
		query := `
			SELECT 
				p.id as pendaftaran_id, u.id as student_id, u.name as student_name, u.email as student_email, u.keahlian,
				CASE WHEN p.beasiswa_id IS NOT NULL THEN 'Beasiswa' ELSE 'Olimpiade' END as program_type,
				COALESCE(b.nama, o.judul) as program_title,
				p.status_id, p.tanggal_daftar
			FROM pendaftarans p
			JOIN users u ON p.user_id = u.id
			LEFT JOIN beasiswas b ON p.beasiswa_id = b.id
			LEFT JOIN olimpiades o ON p.olimpiade_id = o.id
		`
		err = koneksi.DB.Raw(query).Scan(&applicants).Error
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": applicants})
}

// 2. REVIEW APPLICANT STATUS (Mengubah Status Pendaftaran Siswa)
func UpdateApplicantStatus(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	if user.Role != "instansi" && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Hanya instansi atau admin yang dapat mengubah status"})
		return
	}

	pendaftaranID := c.Param("id")
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, pendaftaranID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan"})
		return
	}

	// Jika dia adalah instansi, pastikan dia adalah pemilik dari program beasiswa/olimpiade tersebut
	if user.Role == "instansi" {
		var instansi models.Instansi
		koneksi.DB.Where("user_id = ?", user.ID).First(&instansi)

		var bOwner, oOwner uint
		if pendaftaran.BeasiswaID != nil {
			koneksi.DB.Table("beasiswas").Where("id = ?", pendaftaran.BeasiswaID).Pluck("instansi_id", &bOwner)
		}
		if pendaftaran.OlimpiadeID != nil {
			koneksi.DB.Table("olimpiades").Where("id = ?", pendaftaran.OlimpiadeID).Pluck("instansi_id", &oOwner)
		}

		if bOwner != instansi.ID && oOwner != instansi.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda tidak memiliki hak atas program pendaftaran ini"})
			return
		}
	}

	// Menerima input status baru dari body JSON
	var input struct {
		StatusID uint `json:"status_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input status_id salah"})
		return
	}

	// Eksekusi perubahan status
	pendaftaran.StatusID = &input.StatusID
	koneksi.DB.Save(&pendaftaran)

	c.JSON(http.StatusOK, gin.H{
		"message": "Status pendaftaran siswa berhasil diperbarui!",
		"data":    pendaftaran,
	})
}

func GetRiwayatPendaftaranSiswa(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Pastikan hanya Siswa yang bisa mengakses rute ini
	if user.Role != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Fitur ini khusus untuk akun Siswa"})
		return
	}

	var riwayat []RiwayatPendaftaran

	// Query RAW SQL dengan JOIN ke tabel status_pendaftarans agar nama statusnya ikut terbaca
	query := `
		SELECT 
			p.id as pendaftaran_id,
			CASE WHEN p.beasiswa_id IS NOT NULL THEN 'Beasiswa' ELSE 'Olimpiade' END as program_type,
			COALESCE(b.nama, o.judul) as program_title,
			sp.nama as status_name,
			p.tanggal_daftar
		FROM pendaftarans p
		LEFT JOIN beasiswas b ON p.beasiswa_id = b.id
		LEFT JOIN olimpiades o ON p.olimpiade_id = o.id
		LEFT JOIN status_pendaftarans sp ON p.status_id = sp.id
		WHERE p.user_id = ?
		ORDER BY p.tanggal_daftar DESC
	`
	
	if err := koneksi.DB.Raw(query, userID).Scan(&riwayat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": riwayat})
}