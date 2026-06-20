package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateBeasiswa(c *gin.Context) {
	var beasiswa models.Beasiswa
	if err := c.ShouldBindJSON(&beasiswa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Create(&beasiswa)
	c.JSON(http.StatusCreated, gin.H{"data": beasiswa})
}

func GetAllBeasiswa(c *gin.Context) {
	var beasiswas []models.Beasiswa
	koneksi.DB.Find(&beasiswas)
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