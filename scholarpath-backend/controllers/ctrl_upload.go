package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadFile(c *gin.Context) {
	// Menerima file dari form-data dengan key "file"
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File tidak ditemukan"})
		return
	}

	// Buat nama file unik menggunakan timestamp agar tidak bentrok
	extension := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%d%s", time.Now().Unix(), extension)
	savePath := filepath.Join("storage", "uploads", newFileName)

	// Simpan file ke folder
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
		return
	}

	// Kembalikan URL yang bisa diakses oleh frontend
	fileURL := fmt.Sprintf("http://localhost:8080/uploads/%s", newFileName)

	c.JSON(http.StatusOK, gin.H{
		"message":   "File berhasil diunggah",
		"file_url":  fileURL,
		"file_name": newFileName,
	})
}