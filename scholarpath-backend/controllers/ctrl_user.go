package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func GetAllUser(c *gin.Context) {
	var users []models.User
	koneksi.DB.Find(&users)
	c.JSON(http.StatusOK, gin.H{"data": users})
}

func GetUserByID(c *gin.Context) {
	var user models.User
	if err := koneksi.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": user})
}

func UpdateUser(c *gin.Context) {
	var user models.User
	if err := koneksi.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "User berhasil diupdate", "data": user})
}

func DeleteUser(c *gin.Context) {
	var user models.User
	if err := koneksi.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&user)
	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dihapus"})
}