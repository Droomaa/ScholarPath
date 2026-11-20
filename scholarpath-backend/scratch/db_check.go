package main

import (
	"fmt"
	"log"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=apaaja dbname=ScholarPath port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	koneksi.DB = db

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Println("=== LIST OF USERS IN DATABASE ===")
	for _, u := range users {
		fmt.Printf("ID: %d | Name: %s | Email: %s | Role: %s | Password Hash: %s\n", u.ID, u.Name, u.Email, u.Role, u.Password)
	}
}
