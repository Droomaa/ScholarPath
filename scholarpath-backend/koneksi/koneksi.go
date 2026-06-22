package koneksi

import (
	"log"
	"scholarpath-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func KoneksiDatabase() {
	// DSN (Data Source Name) khusus untuk PostgreSQL
	// Sesuaikan password jika user postgres kamu menggunakan password
	dsn := "host=localhost user=postgres password=apaaja dbname=ScholarPath port=5432 sslmode=disable TimeZone=Asia/Jakarta"

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke DB Postgres: ", err)
	}

	DB = database
	log.Println("Database PostgreSQL berhasil terhubung!")

	// Tambah kolom secara manual menggunakan raw SQL ke tabel users agar tidak merusak constraint Laravel
	database.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT 'student'`)
	database.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS keahlian TEXT`)
	database.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS jenjang_id INTEGER`)

	// Jalankan AutoMigrate untuk model lainnya saja
	err = DB.AutoMigrate(
		&models.Instansi{},
		&models.JenjangPendidikan{},
		&models.Kategori{},
		&models.Olimpiade{},
		&models.Beasiswa{},
		&models.Pendaftaran{},
		&models.Notification{},
		&models.Wishlist{},
	)
	if err != nil {
		log.Println("Gagal menjalankan AutoMigrate GORM:", err)
	} else {
		log.Println("Schema database berhasil disinkronisasi melalui GORM AutoMigrate!")
	}

	// Reset PostgreSQL sequences agar tidak terjadi duplicate key error
	// (terjadi jika data pernah diinsert manual tanpa melewati sequence)
	sequenceTables := []string{"beasiswas", "olimpiades", "instansis", "users", "pendaftarans", "notifications", "wishlists"}
	for _, table := range sequenceTables {
		DB.Exec(`SELECT setval(pg_get_serial_sequence('` + table + `', 'id'), COALESCE((SELECT MAX(id) FROM ` + table + `), 0) + 1, false)`)
	}
	log.Println("Sequence database berhasil direset!")
}
