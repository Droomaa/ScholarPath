package routes

import (
	"scholarpath-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.POST("/register", controllers.RegisterUser)
	r.POST("/login", controllers.LoginUser)

	// digrupin supaya rapi
	api := r.Group("/api")
	{
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

		// Admin
		api.POST("/admin", controllers.CreateAdmin)
		api.GET("/admin", controllers.GetAllAdmin)
		api.GET("/admin/:id", controllers.GetAdminByID)
		api.PUT("/admin/:id", controllers.UpdateAdmin)
		api.DELETE("/admin/:id", controllers.DeleteAdmin)

		// Jenjang Pendidikan
		api.POST("/jenjang", controllers.CreateJenjang)
		api.GET("/jenjang", controllers.GetAllJenjang)
		api.GET("/jenjang/:id", controllers.GetJenjangByID)
		api.PUT("/jenjang/:id", controllers.UpdateJenjang)
		api.DELETE("/jenjang/:id", controllers.DeleteJenjang)

		// User (Khusus Data)
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