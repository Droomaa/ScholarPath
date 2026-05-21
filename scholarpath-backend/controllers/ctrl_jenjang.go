package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateJenjang(c *gin.Context) {
	var input models.JenjangPendidikan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan jenjang pendidikan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jenjang berhasil dibuat", "data": input})
}

func GetAllJenjang(c *gin.Context) {
	var jenjang []models.JenjangPendidikan
	koneksi.DB.Find(&jenjang)
	c.JSON(http.StatusOK, gin.H{"data": jenjang})
}

func GetJenjangByID(c *gin.Context) {
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": jenjang})
}

func UpdateJenjang(c *gin.Context) {
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&jenjang); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&jenjang)
	c.JSON(http.StatusOK, gin.H{"message": "Jenjang berhasil diupdate", "data": jenjang})
}

func DeleteJenjang(c *gin.Context) {
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&jenjang)
	c.JSON(http.StatusOK, gin.H{"message": "Jenjang berhasil dihapus"})
}