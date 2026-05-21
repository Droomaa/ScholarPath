package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateBeasiswa(c *gin.Context) {
	var input models.Beasiswa
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan beasiswa: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil dibuat", "data": input})
}

func GetAllBeasiswa(c *gin.Context) {
	var beasiswa []models.Beasiswa
	koneksi.DB.Find(&beasiswa)
	c.JSON(http.StatusOK, gin.H{"data": beasiswa})
}

func GetBeasiswaByID(c *gin.Context) {
	var beasiswa models.Beasiswa
	id := c.Param("id")

	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": beasiswa})
}

func UpdateBeasiswa(c *gin.Context) {
	var beasiswa models.Beasiswa
	id := c.Param("id")

	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&beasiswa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	koneksi.DB.Save(&beasiswa)
	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil diupdate", "data": beasiswa})
}

func DeleteBeasiswa(c *gin.Context) {
	var beasiswa models.Beasiswa
	id := c.Param("id")

	if err := koneksi.DB.First(&beasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Beasiswa tidak ditemukan"})
		return
	}

	koneksi.DB.Delete(&beasiswa)
	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil dihapus"})
}