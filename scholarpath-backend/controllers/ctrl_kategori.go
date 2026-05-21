package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

//CREATE
func CreateKategori(c *gin.Context) {
	var input models.Kategori
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := koneksi.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kategori"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dibuat", "data": input})
}

func GetAllKategori(c *gin.Context) {
	var kategori []models.Kategori
	koneksi.DB.Find(&kategori)
	c.JSON(http.StatusOK, gin.H{"data": kategori})
}

func GetKategoriByID(c *gin.Context) {
	var kategori models.Kategori
	id := c.Param("id")

	if err := koneksi.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": kategori})
}

func UpdateKategori(c *gin.Context) {
	var kategori models.Kategori
	id := c.Param("id")

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
	var kategori models.Kategori
	id := c.Param("id")

	if err := koneksi.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	koneksi.DB.Delete(&kategori)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}