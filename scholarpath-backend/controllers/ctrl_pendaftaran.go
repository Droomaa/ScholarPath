package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

func CreatePendaftaran(c *gin.Context) {
	var input models.Pendaftaran
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Set tanggal otomatis saat ini
	input.TglDaftar = time.Now()
	
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal melakukan pendaftaran: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil dibuat", "data": input})
}

func GetAllPendaftaran(c *gin.Context) {
	var pendaftaran []models.Pendaftaran
	koneksi.DB.Find(&pendaftaran)
	c.JSON(http.StatusOK, gin.H{"data": pendaftaran})
}

func GetPendaftaranByID(c *gin.Context) {
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pendaftaran})
}

func UpdatePendaftaran(c *gin.Context) {
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&pendaftaran)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil diupdate", "data": pendaftaran})
}

func DeletePendaftaran(c *gin.Context) {
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&pendaftaran)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil dihapus"})
}