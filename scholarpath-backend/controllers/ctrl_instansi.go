package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func GetAllInstansi(c *gin.Context) {
	var instansis []models.Instansi
	koneksi.DB.Find(&instansis)
	c.JSON(http.StatusOK, gin.H{"data": instansis})
}

func GetInstansiByID(c *gin.Context) {
	id := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

// Opsional untuk admin / instansi itu sendiri
func UpdateInstansi(c *gin.Context) {
	id := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&instansi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&instansi)
	c.JSON(http.StatusOK, gin.H{"message": "Data instansi diupdate", "data": instansi})
}