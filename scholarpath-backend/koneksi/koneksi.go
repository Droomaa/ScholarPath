package koneksi

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func KoneksiDatabase() {
	// Ganti sandi, port (misal 3317), dan nama database sesuai Laragon kamu
	dsn := "root:@tcp(127.0.0.1:3317)/beasiswa?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	
	if err != nil {
		panic("Gagal koneksi ke DB: " + err.Error())
	}
	
	DB = database
}