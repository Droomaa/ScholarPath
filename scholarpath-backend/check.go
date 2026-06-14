package main

import (
	"fmt"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	koneksi.KoneksiDatabase()

	var kats []models.Kategori
	koneksi.DB.Find(&kats)
	for _, k := range kats {
		fmt.Printf("Kategori ID: %d, '%s'\n", k.ID, k.Nama)
	}

	var jens []models.JenjangPendidikan
	koneksi.DB.Find(&jens)
	for _, j := range jens {
		fmt.Printf("Jenjang ID: %d, '%s'\n", j.ID, j.Nama)
	}
}
