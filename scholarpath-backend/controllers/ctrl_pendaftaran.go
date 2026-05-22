package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

func CreatePendaftaran(c *gin.Context) {
	var pendaftaran models.Pendaftaran
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Create(&pendaftaran)
	c.JSON(http.StatusCreated, gin.H{"data": pendaftaran})
}

func GetAllPendaftaran(c *gin.Context) {
	var pendaftarans []models.Pendaftaran
	koneksi.DB.Find(&pendaftarans)
	c.JSON(http.StatusOK, gin.H{"data": pendaftarans})
}

func GetPendaftaranByID(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": pendaftaran})
}

func UpdatePendaftaran(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&pendaftaran); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Save(&pendaftaran)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran diupdate", "data": pendaftaran})
}

func DeletePendaftaran(c *gin.Context) {
	id := c.Param("id")
	var pendaftaran models.Pendaftaran
	if err := koneksi.DB.First(&pendaftaran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&pendaftaran)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil dihapus"})
}