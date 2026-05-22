package koneksi

import (
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func KoneksiDatabase() {
	// DSN (Data Source Name) khusus untuk PostgreSQL
	// Sesuaikan password jika user postgres kamu menggunakan password
	dsn := "host=localhost user=postgres password= dbname=ScholarPath port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke DB Postgres: ", err)
	}
	
	DB = database
	log.Println("Database PostgreSQL berhasil terhubung!")
}