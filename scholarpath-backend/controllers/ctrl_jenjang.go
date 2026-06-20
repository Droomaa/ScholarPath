package controllers

import (
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateJenjang(c *gin.Context) {
	var jenjang models.JenjangPendidikan
	if err := c.ShouldBindJSON(&jenjang); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Create(&jenjang)
	c.JSON(http.StatusCreated, gin.H{"data": jenjang})
}

func GetAllJenjang(c *gin.Context) {
	var jenjangs []models.JenjangPendidikan
	koneksi.DB.Find(&jenjangs)
	c.JSON(http.StatusOK, gin.H{"data": jenjangs})
}

func GetJenjangByID(c *gin.Context) {
	id := c.Param("id")
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang Pendidikan tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": jenjang})
}

func UpdateJenjang(c *gin.Context) {
	id := c.Param("id")
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang Pendidikan tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&jenjang); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	koneksi.DB.Save(&jenjang)
	c.JSON(http.StatusOK, gin.H{"message": "Jenjang Pendidikan berhasil diupdate", "data": jenjang})
}

func DeleteJenjang(c *gin.Context) {
	id := c.Param("id")
	var jenjang models.JenjangPendidikan
	if err := koneksi.DB.First(&jenjang, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jenjang Pendidikan tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&jenjang)
	c.JSON(http.StatusOK, gin.H{"message": "Jenjang Pendidikan berhasil dihapus"})
}