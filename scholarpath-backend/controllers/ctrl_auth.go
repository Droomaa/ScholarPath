package controllers

import (
	"crypto/rand"
	"encoding/json"
	"math/big"
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"scholarpath-backend/utils"

	"github.com/gin-gonic/gin"
)

// --- STRUKTUR INPUT ---
type RegisterSiswaInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterInstansiInput struct {
	Name     string `json:"name" binding:"required"` // Nama Instansi (untuk akun login dan profil)
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Alamat   string `json:"alamat" binding:"required"`
	Kontak   string `json:"kontak" binding:"required"`
}

type RegisterAdminInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// --- FUNGSI CONTROLLER ---

func RegisterSiswa(c *gin.Context) {
	var input RegisterSiswaInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := utils.HashPassword(input.Password)
	user := models.User{Name: input.Name, Email: input.Email, Password: hashedPassword, Role: "student"}

	if err := koneksi.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Email sudah digunakan (Detail: " + err.Error() + ")"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi Siswa berhasil!", "data": user})
}

func RegisterInstansi(c *gin.Context) {
	var input RegisterInstansiInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Gunakan Transaction agar jika profil gagal dibuat, akun login dibatalkan
	tx := koneksi.DB.Begin()

	hashedPassword, _ := utils.HashPassword(input.Password)
	user := models.User{Name: input.Name, Email: input.Email, Password: hashedPassword, Role: "instansi"}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Email sudah digunakan (Detail: " + err.Error() + ")"})
		return
	}

	instansi := models.Instansi{UserID: &user.ID, Nama: input.Name, Alamat: input.Alamat, Kontak: input.Kontak}
	if err := tx.Create(&instansi).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan profil instansi (Detail: " + err.Error() + ")"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi Instansi berhasil!", "data_login": user, "data_profil": instansi})
}

func RegisterAdmin(c *gin.Context) {
	// 1. Dapatkan ID yang sedang request (dari middleware)
	loggedInUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak"})
		return
	}

	// 2. Verifikasi apakah yang request benar-benar seorang Admin
	var loggedInUser models.User
	if err := koneksi.DB.First(&loggedInUser, loggedInUserID).Error; err != nil || loggedInUser.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya Admin yang dapat mendaftarkan Admin baru!"})
		return
	}

	// 3. Lakukan registrasi
	var input RegisterAdminInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := utils.HashPassword(input.Password)
	user := models.User{Name: input.Name, Email: input.Email, Password: hashedPassword, Role: "admin"}

	if err := koneksi.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Email sudah digunakan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi Admin baru berhasil!", "data": user})
}

func LoginUser(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := koneksi.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email tidak terdaftar"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		return
	}

	token, _ := utils.GenerateJWT(user.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   token,
		"role":    user.Role,
		"name":    user.Name,
		"user_id": user.ID,
	})
}

// --- GOOGLE SIGN-IN ---
type LoginGoogleInput struct {
	AccessToken string `json:"access_token" binding:"required"`
	Role        string `json:"role"` // optional, "siswa" atau "instansi"
}

func generateRandomPassword() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 16)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		result[i] = chars[num.Int64()]
	}
	return string(result)
}

func LoginGoogle(c *gin.Context) {
	var input LoginGoogleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verifikasi token dengan Google UserInfo API
	resp, err := http.Get("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + input.AccessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal terhubung ke server verifikasi Google"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token Google tidak valid atau kedaluwarsa"})
		return
	}

	var googleInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengurai respon Google"})
		return
	}

	if googleInfo.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email tidak ditemukan di token Google"})
		return
	}

	// Cari user berdasarkan email
	var user models.User
	err = koneksi.DB.Where("email = ?", googleInfo.Email).First(&user).Error
	if err != nil {
		// User belum terdaftar, buat akun baru
		randPass := generateRandomPassword()
		hashedPassword, _ := utils.HashPassword(randPass)

		// Set default role sesuai tab yang dipilih
		role := "student"
		if input.Role == "instansi" {
			role = "instansi"
		}

		user = models.User{
			Name:     googleInfo.Name,
			Email:    googleInfo.Email,
			Password: hashedPassword,
			Role:     role,
		}

		if err := koneksi.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftarkan user baru dari Google"})
			return
		}

		// Jika role adalah instansi, buat profil instansi kosong
		if role == "instansi" {
			instansi := models.Instansi{
				UserID: &user.ID,
				Nama:   googleInfo.Name,
				Alamat: "-",
				Kontak: "-",
			}
			koneksi.DB.Create(&instansi)
		}
	}

	// Validasi kesesuaian role tab
	loginRole := "siswa"
	if input.Role == "instansi" {
		loginRole = "instansi"
	}
	dbRole := user.Role

	if loginRole == "siswa" && dbRole != "student" && dbRole != "siswa" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Akun ini bukan akun Siswa. Silakan masuk melalui tab yang sesuai."})
		return
	}

	if loginRole == "instansi" && dbRole != "instansi" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Akun ini bukan akun Instansi. Silakan masuk melalui tab yang sesuai."})
		return
	}

	// Generate JWT Token
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token akses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login Google berhasil",
		"token":   token,
		"role":    user.Role,
		"name":    user.Name,
		"user_id": user.ID,
	})
}