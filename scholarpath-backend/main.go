package main

import (
	"log"
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
	r := routes.SetupRouter()
	r.Run(":8080")
}