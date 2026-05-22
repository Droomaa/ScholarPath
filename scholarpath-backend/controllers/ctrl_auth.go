package controllers

import (
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"scholarpath-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"` // Bisa diisi "admin" atau dikosongkan (otomatis "student")
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func RegisterUser(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses enkripsi password"})
		return
	}

	// Set default role menjadi student jika tidak diisi admin
	role := "student"
	if input.Role == "admin" {
		role = "admin"
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     role,
	}

	if err := koneksi.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftar, email mungkin sudah digunakan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil", "data": user})
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

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproduksi token akses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   token,
		"role":    user.Role,
		"name":    user.Name,
		"user_id": user.ID,
	})
}