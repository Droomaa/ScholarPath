package routes

import (
	"scholarpath-backend/controllers"
	"scholarpath-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	// BUKA AKSES FOLDER UPLOADS KE PUBLIK
	r.Static("/uploads", "./storage/uploads")

	// Rute Publik (Tanpa Token)
	r.POST("/login", controllers.LoginUser)
	r.POST("/register/siswa", controllers.RegisterSiswa)
	r.POST("/register/instansi", controllers.RegisterInstansi)

	// Rute Khusus Registrasi Admin (Wajib Token Admin)
	r.POST("/register/admin", middleware.AuthMiddleware(), controllers.RegisterAdmin)

	// Grup Rute API (Bisa ditambahkan AuthMiddleware jika ingin semua CRUD dikunci token)
	api := r.Group("/api")
	{
		// AI Engine Bridge
		api.GET("/ai/recommendation", middleware.AuthMiddleware(), controllers.GetAIRecommendation)
		api.POST("/upload", controllers.UploadFile)
		// Kategori
		api.POST("/kategori", controllers.CreateKategori)
		api.GET("/kategori", controllers.GetAllKategori)
		api.GET("/kategori/:id", controllers.GetKategoriByID)
		api.PUT("/kategori/:id", controllers.UpdateKategori)
		api.DELETE("/kategori/:id", controllers.DeleteKategori)

		// Beasiswa
		api.POST("/beasiswa", controllers.CreateBeasiswa)
		api.GET("/beasiswa", controllers.GetAllBeasiswa)
		api.GET("/beasiswa/:id", controllers.GetBeasiswaByID)
		api.PUT("/beasiswa/:id", controllers.UpdateBeasiswa)
		api.DELETE("/beasiswa/:id", controllers.DeleteBeasiswa)

		// Jenjang Pendidikan
		api.POST("/jenjang", controllers.CreateJenjang)
		api.GET("/jenjang", controllers.GetAllJenjang)
		api.GET("/jenjang/:id", controllers.GetJenjangByID)
		api.PUT("/jenjang/:id", controllers.UpdateJenjang)
		api.DELETE("/jenjang/:id", controllers.DeleteJenjang)

		// User (Mencakup data Admin, Instansi, dan Student)
		api.GET("/user", controllers.GetAllUser)
		api.GET("/user/:id", controllers.GetUserByID)
		api.PUT("/user/:id", controllers.UpdateUser)
		api.DELETE("/user/:id", controllers.DeleteUser)

		// Instansi
		api.POST("/instansi", controllers.CreateInstansi)
		api.GET("/instansi", controllers.GetAllInstansi)
		api.GET("/instansi/:id", controllers.GetInstansiByID)
		api.PUT("/instansi/:id", controllers.UpdateInstansi)
		api.DELETE("/instansi/:id", controllers.DeleteInstansi)

		// Olimpiade
		api.POST("/olimpiade", controllers.CreateOlimpiade)
		api.GET("/olimpiade", controllers.GetAllOlimpiade)
		api.GET("/olimpiade/:id", controllers.GetOlimpiadeByID)
		api.PUT("/olimpiade/:id", controllers.UpdateOlimpiade)
		api.DELETE("/olimpiade/:id", controllers.DeleteOlimpiade)

		// Pendaftaran
		api.POST("/pendaftaran", controllers.CreatePendaftaran)
		api.GET("/pendaftaran", controllers.GetAllPendaftaran)
		api.GET("/pendaftaran/:id", controllers.GetPendaftaranByID)
		api.PUT("/pendaftaran/:id", controllers.UpdatePendaftaran)
		api.DELETE("/pendaftaran/:id", controllers.DeletePendaftaran)
	}

	return r
}