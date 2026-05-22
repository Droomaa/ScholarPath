package controllers

import (
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateKategori(c *gin.Context) {
	var kategori models.Kategori
	if err := c.ShouldBindJSON(&kategori); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	koneksi.DB.Create(&kategori)
	c.JSON(http.StatusCreated, gin.H{"data": kategori})
}

func GetAllKategori(c *gin.Context) {
	var kategoris []models.Kategori
	koneksi.DB.Find(&kategoris)
	c.JSON(http.StatusOK, gin.H{"data": kategoris})
}

func GetKategoriByID(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := koneksi.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": kategori})
}

func UpdateKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := koneksi.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&kategori); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	koneksi.DB.Save(&kategori)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil diupdate", "data": kategori})
}

func DeleteKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := koneksi.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}
	koneksi.DB.Delete(&kategori)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}