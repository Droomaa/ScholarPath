package controllers

import (
	"fmt"
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"strconv"
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
	StatusID          *uint     `json:"status_id"`
	TanggalDaftar     time.Time `json:"tanggal_daftar"`
	ResumeUrl         string    `json:"resume_url"`
	ReportCardUrl     string    `json:"report_card_url"`
	ProposalUrl       string    `json:"proposal_url"`
	RecommendationUrl string    `json:"recommendation_url"`
	Alasan            string    `json:"alasan"`
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
	pendaftaran.UserID = userID
	pendaftaran.TanggalDaftar = time.Now()

	beasiswaIDStr := c.PostForm("beasiswa_id")
	if beasiswaIDStr != "" {
		id, _ := strconv.ParseUint(beasiswaIDStr, 10, 32)
		val := uint(id)
		
		// Mencegah pendaftaran ganda
		var existing models.Pendaftaran
		if err := koneksi.DB.Where("user_id = ? AND beasiswa_id = ?", userID, val).First(&existing).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Anda sudah mendaftar program beasiswa ini"})
			return
		}
		
		pendaftaran.BeasiswaID = &val
	}

	olimpiadeIDStr := c.PostForm("olimpiade_id")
	if olimpiadeIDStr != "" {
		id, _ := strconv.ParseUint(olimpiadeIDStr, 10, 32)
		val := uint(id)
		
		// Mencegah pendaftaran ganda
		var existing models.Pendaftaran
		if err := koneksi.DB.Where("user_id = ? AND olimpiade_id = ?", userID, val).First(&existing).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Anda sudah mendaftar program kompetisi ini"})
			return
		}
		
		pendaftaran.OlimpiadeID = &val
	}
	
	statusVal := uint(1) // 1 = Pending / In Progress
	pendaftaran.StatusID = &statusVal
	pendaftaran.Alasan = c.PostForm("alasan")

	// Helper for file upload
	uploadFile := func(formKey string) string {
		file, err := c.FormFile(formKey)
		if err == nil {
			filename := fmt.Sprintf("%d_%d_%s", time.Now().Unix(), userID, file.Filename)
			filepath := "storage/uploads/" + filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				return "/uploads/" + filename
			}
		}
		return ""
	}

	pendaftaran.ResumeUrl = uploadFile("resume")
	pendaftaran.ReportCardUrl = uploadFile("report_card")
	pendaftaran.ProposalUrl = uploadFile("proposal")
	pendaftaran.RecommendationUrl = uploadFile("recommendation")

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
				p.status_id, p.tanggal_daftar,
				p.resume_url, p.report_card_url, p.proposal_url, p.recommendation_url, p.alasan
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
				p.status_id, p.tanggal_daftar,
				p.resume_url, p.report_card_url, p.proposal_url, p.recommendation_url, p.alasan
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

	// Query RAW SQL dengan CASE untuk mendapatkan status_name
	query := `
		SELECT 
			p.id as pendaftaran_id,
			CASE WHEN p.beasiswa_id IS NOT NULL THEN 'Beasiswa' ELSE 'Olimpiade' END as program_type,
			COALESCE(b.nama, o.judul) as program_title,
			CASE 
				WHEN p.status_id = 3 THEN 'Accepted'
				WHEN p.status_id = 4 THEN 'Rejected'
				ELSE 'Pending'
			END as status_name,
			p.tanggal_daftar
		FROM pendaftarans p
		LEFT JOIN beasiswas b ON p.beasiswa_id = b.id
		LEFT JOIN olimpiades o ON p.olimpiade_id = o.id
		WHERE p.user_id = ?
		ORDER BY p.tanggal_daftar DESC
	`
	
	if err := koneksi.DB.Raw(query, userID).Scan(&riwayat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": riwayat})
}

func GetPendaftaranDetailSiswa(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	pendaftaranID := c.Param("id")
	var pendaftaran models.Pendaftaran

	if err := koneksi.DB.Where("id = ? AND user_id = ?", pendaftaranID, userID).First(&pendaftaran).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan atau Anda tidak berhak"})
		return
	}

	response := gin.H{
		"id": pendaftaran.ID,
		"user_id": pendaftaran.UserID,
		"beasiswa_id": pendaftaran.BeasiswaID,
		"olimpiade_id": pendaftaran.OlimpiadeID,
		"status_id": pendaftaran.StatusID,
		"resume_url": pendaftaran.ResumeUrl,
		"report_card_url": pendaftaran.ReportCardUrl,
		"proposal_url": pendaftaran.ProposalUrl,
		"recommendation_url": pendaftaran.RecommendationUrl,
		"alasan": pendaftaran.Alasan,
		"tanggal_daftar": pendaftaran.TanggalDaftar,
	}

	if pendaftaran.BeasiswaID != nil {
		var b models.Beasiswa
		koneksi.DB.First(&b, pendaftaran.BeasiswaID)
		response["beasiswa"] = b
	} else if pendaftaran.OlimpiadeID != nil {
		var o models.Olimpiade
		koneksi.DB.First(&o, pendaftaran.OlimpiadeID)
		response["olimpiade"] = o
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

func UpdatePendaftaranBerkas(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	pendaftaranID := c.Param("id")
	var pendaftaran models.Pendaftaran

	if err := koneksi.DB.Where("id = ? AND user_id = ?", pendaftaranID, userID).First(&pendaftaran).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pendaftaran tidak ditemukan atau Anda tidak berhak"})
		return
	}

	alasan := c.PostForm("alasan")
	if alasan != "" {
		pendaftaran.Alasan = alasan
	}

	// Helper for file upload
	uploadFile := func(formKey string) string {
		file, err := c.FormFile(formKey)
		if err == nil {
			filename := fmt.Sprintf("%d_%d_%s", time.Now().Unix(), userID, file.Filename)
			filepath := "storage/uploads/" + filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				return "/uploads/" + filename
			}
		}
		return ""
	}

	if url := uploadFile("resume"); url != "" {
		pendaftaran.ResumeUrl = url
	}
	if url := uploadFile("report_card"); url != "" {
		pendaftaran.ReportCardUrl = url
	}
	if url := uploadFile("proposal"); url != "" {
		pendaftaran.ProposalUrl = url
	}
	if url := uploadFile("recommendation"); url != "" {
		pendaftaran.RecommendationUrl = url
	}

	if err := koneksi.DB.Save(&pendaftaran).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berkas pendaftaran berhasil diperbarui",
		"data":    pendaftaran,
	})
}