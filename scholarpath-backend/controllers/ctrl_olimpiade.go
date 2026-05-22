package controllers

import (
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateOlimpiade(c *gin.Context) {
	var olimpiade models.Olimpiade
	if err := c.ShouldBindJSON(&olimpiade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Create(&olimpiade)
	c.JSON(http.StatusCreated, gin.H{"data": olimpiade})
}

func GetAllOlimpiade(c *gin.Context) {
	var olimpiades []models.Olimpiade
	koneksi.DB.Find(&olimpiades)
	c.JSON(http.StatusOK, gin.H{"data": olimpiades})
}

func GetOlimpiadeByID(c *gin.Context) {
	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": olimpiade})
}

func UpdateOlimpiade(c *gin.Context) {
	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
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
	id := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Olimpiade tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&olimpiade)
	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil dihapus"})
}