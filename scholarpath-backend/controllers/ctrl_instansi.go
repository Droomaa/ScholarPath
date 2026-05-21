package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateInstansi(c *gin.Context) {
	var input models.Instansi
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan instansi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Instansi berhasil dibuat", "data": input})
}

func GetAllInstansi(c *gin.Context) {
	var instansi []models.Instansi
	koneksi.DB.Find(&instansi)
	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

func GetInstansiByID(c *gin.Context) {
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": instansi})
}

func UpdateInstansi(c *gin.Context) {
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&instansi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&instansi)
	c.JSON(http.StatusOK, gin.H{"message": "Instansi berhasil diupdate", "data": instansi})
}

func DeleteInstansi(c *gin.Context) {
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instansi tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&instansi)
	c.JSON(http.StatusOK, gin.H{"message": "Instansi berhasil dihapus"})
}