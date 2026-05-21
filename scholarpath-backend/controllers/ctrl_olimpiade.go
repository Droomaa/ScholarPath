package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateOlimpiade(c *gin.Context) {
	var input models.Olimpiade
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan olimpiade: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil dibuat", "data": input})
}

func GetAllOlimpiade(c *gin.Context) {
	var olimpiade []models.Olimpiade
	koneksi.DB.Find(&olimpiade)
	c.JSON(http.StatusOK, gin.H{"data": olimpiade})
}

func GetOlimpiadeByID(c *gin.Context) {
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": olimpiade})
}

func UpdateOlimpiade(c *gin.Context) {
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&olimpiade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&olimpiade)
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil diupdate", "data": olimpiade})
}

func DeleteOlimpiade(c *gin.Context) {
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&olimpiade)
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil dihapus"})
}