package main

import (
	"log"
	"scholarpath-backend/controllers"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/routes"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file tidak ditemukan")
	}

	koneksi.KoneksiDatabase()
	controllers.SyncDatabaseToCSV()
	r := routes.SetupRouter()
	r.Run("0.0.0.0:8080")
}