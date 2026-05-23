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

	// Grup Utama API
	api := r.Group("/api")
	
	// Rute Publik di bawah /api (Misal upload boleh diakses tanpa token)
	api.POST("/upload", controllers.UploadFile) 

	// Grup Rute yang Dilindungi (Wajib Token)
	// Kita buat grup baru agar middleware benar-benar terisolasi
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// Rute User Profile
		protected.GET("/user/profile", controllers.GetMyProfile)
		protected.PUT("/user/profile", controllers.UpdateProfile)

		// AI Engine Bridge
		protected.GET("/ai/recommendation", controllers.GetAIRecommendation)

		// Kategori
		protected.POST("/kategori", controllers.CreateKategori)
		protected.GET("/kategori", controllers.GetAllKategori)
		protected.GET("/kategori/:id", controllers.GetKategoriByID)
		protected.PUT("/kategori/:id", controllers.UpdateKategori)
		protected.DELETE("/kategori/:id", controllers.DeleteKategori)

		// Beasiswa
		protected.POST("/beasiswa", controllers.CreateBeasiswa)
		protected.GET("/beasiswa", controllers.GetAllBeasiswa)
		protected.GET("/beasiswa/:id", controllers.GetBeasiswaByID)
		protected.PUT("/beasiswa/:id", controllers.UpdateBeasiswa)
		protected.DELETE("/beasiswa/:id", controllers.DeleteBeasiswa)

		// Jenjang Pendidikan
		protected.POST("/jenjang", controllers.CreateJenjang)
		protected.GET("/jenjang", controllers.GetAllJenjang)
		protected.GET("/jenjang/:id", controllers.GetJenjangByID)
		protected.PUT("/jenjang/:id", controllers.UpdateJenjang)
		protected.DELETE("/jenjang/:id", controllers.DeleteJenjang)

		// Instansi
		protected.GET("/instansi", controllers.GetAllInstansi)
		protected.GET("/instansi/:id", controllers.GetInstansiByID)
		protected.PUT("/instansi/:id", controllers.UpdateInstansi)

		// Olimpiade
		protected.POST("/olimpiade", controllers.CreateOlimpiade)
		protected.GET("/olimpiade", controllers.GetAllOlimpiade)
		protected.GET("/olimpiade/:id", controllers.GetOlimpiadeByID)
		protected.PUT("/olimpiade/:id", controllers.UpdateOlimpiade)
		protected.DELETE("/olimpiade/:id", controllers.DeleteOlimpiade)

		// Pendaftaran
		protected.POST("/pendaftaran", controllers.CreatePendaftaran)
		protected.GET("/pendaftaran", controllers.GetAllPendaftaran)
		protected.GET("/pendaftaran/:id", controllers.GetPendaftaranByID)
		protected.PUT("/pendaftaran/:id", controllers.UpdatePendaftaran)
		protected.DELETE("/pendaftaran/:id", controllers.DeletePendaftaran)
	}

	return r
}