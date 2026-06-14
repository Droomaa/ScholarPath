package main

import (
	"log"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	koneksi.KoneksiDatabase()

	kategoris := []string{"Dalam Negeri", "Luar Negeri", "Akademik", "Non Akademik"}
	for _, name := range kategoris {
		var kat models.Kategori
		err := koneksi.DB.Where("nama = ?", name).FirstOrCreate(&kat, models.Kategori{Nama: name}).Error
		if err != nil {
			log.Println("Gagal insert Kategori:", name)
		}
	}

	jenjangs := []string{"SMP", "SMA"}
	for _, name := range jenjangs {
		var jen models.JenjangPendidikan
		err := koneksi.DB.Where("nama = ?", name).FirstOrCreate(&jen, models.JenjangPendidikan{Nama: name}).Error
		if err != nil {
			log.Println("Gagal insert Jenjang:", name)
		}
	}

	log.Println("Seeding selesai.")
}
