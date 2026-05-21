package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateAdmin(c *gin.Context) {
	var input models.Admin
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan admin"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Admin berhasil dibuat", "data": input})
}

func GetAllAdmin(c *gin.Context) {
	var admins []models.Admin
	koneksi.DB.Find(&admins)
	c.JSON(http.StatusOK, gin.H{"data": admins})
}

func GetAdminByID(c *gin.Context) {
	var admin models.Admin
	if err := koneksi.DB.First(&admin, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": admin})
}

func UpdateAdmin(c *gin.Context) {
	var admin models.Admin
	if err := koneksi.DB.First(&admin, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&admin)
	c.JSON(http.StatusOK, gin.H{"message": "Admin berhasil diupdate", "data": admin})
}

func DeleteAdmin(c *gin.Context) {
	var admin models.Admin
	if err := koneksi.DB.First(&admin, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&admin)
	c.JSON(http.StatusOK, gin.H{"message": "Admin berhasil dihapus"})
}