package koneksi

import (
	"log"
	"scholarpath-backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var SQLiteDB *gorm.DB

func KoneksiSQLite() {
	database, err := gorm.Open(sqlite.Open("storage/preferences.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke DB SQLite: ", err)
	}

	SQLiteDB = database
	log.Println("Database SQLite berhasil terhubung!")

	err = SQLiteDB.AutoMigrate(
		&models.UserPreference{},
	)
	if err != nil {
		log.Println("Gagal menjalankan AutoMigrate SQLite:", err)
	} else {
		log.Println("Schema SQLite berhasil disinkronisasi!")
	}
}
