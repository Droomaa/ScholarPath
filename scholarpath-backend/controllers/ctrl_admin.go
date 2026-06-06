package controllers

import (
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"

	"github.com/gin-gonic/gin"
)

// Helper internal untuk memastikan yang akses benar-benar ADMIN
func enforceAdminRole(c *gin.Context) (uint, bool) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return 0, false
	}

	var user models.User
	if err := koneksi.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return 0, false
	}

	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Fitur ini khusus Admin!"})
		return 0, false
	}

	return userID, true
}

// 1. VERIFY INSTANSI ACCOUNTS
func VerifyInstansi(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	instansiID := c.Param("id")
	var instansi models.Instansi
	if err := koneksi.DB.First(&instansi, instansiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data instansi tidak ditemukan"})
		return
	}

	// Ubah status menjadi true
	instansi.IsVerified = true
	koneksi.DB.Save(&instansi)

	c.JSON(http.StatusOK, gin.H{"message": "Akun Instansi berhasil diverifikasi", "data": instansi})
}

// 2. VERIFY OLIMPIADE
func VerifyOlimpiade(c *gin.Context) {
	adminID, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	olimpiadeID := c.Param("id")
	var olimpiade models.Olimpiade
	if err := koneksi.DB.First(&olimpiade, olimpiadeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data Olimpiade tidak ditemukan"})
		return
	}

	// Isi kolom VerifiedBy dengan ID Admin yang sedang login
	olimpiade.VerifiedBy = &adminID
	koneksi.DB.Save(&olimpiade)

	c.JSON(http.StatusOK, gin.H{"message": "Olimpiade berhasil diverifikasi oleh Admin", "data": olimpiade})
}

// 3. VERIFY BEASISWA
func VerifyBeasiswa(c *gin.Context) {
	adminID, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	beasiswaID := c.Param("id")
	var beasiswa models.Beasiswa
	if err := koneksi.DB.First(&beasiswa, beasiswaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data Beasiswa tidak ditemukan"})
		return
	}

	beasiswa.VerifiedBy = &adminID
	koneksi.DB.Save(&beasiswa)

	c.JSON(http.StatusOK, gin.H{"message": "Beasiswa berhasil diverifikasi oleh Admin", "data": beasiswa})
}

// 4. SEND NOTIFICATION (Admin ke User/Instansi)
func CreateNotification(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var notif models.Notification
	if err := c.ShouldBindJSON(&notif); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validasi apakah user penerima itu ada
	var targetUser models.User
	if err := koneksi.DB.First(&targetUser, notif.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User penerima tidak ditemukan di database"})
		return
	}

	koneksi.DB.Create(&notif)
	c.JSON(http.StatusCreated, gin.H{"message": "Notifikasi berhasil dikirim", "data": notif})
}

// 5. GET MY NOTIFICATIONS (Untuk Siswa/Instansi melihat pesan masuk)
func GetMyNotifications(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda harus login"})
		return
	}

	var notifs []models.Notification
	// Ambil notifikasi milik user ini, urutkan dari yang paling baru
	koneksi.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&notifs)

	c.JSON(http.StatusOK, gin.H{"data": notifs})
}

// 6. GET ALL USERS FOR USER MANAGEMENT
type UserListItem struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Keahlian   string `json:"keahlian"`
	IsVerified bool   `json:"is_verified"` // for instansi role
	CreatedAt  string `json:"created_at"`
}

func GetAdminUsers(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var users []models.User
	if err := koneksi.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch all instansis to check verification status for role = "instansi"
	var instansis []models.Instansi
	koneksi.DB.Find(&instansis)
	instansiMap := make(map[uint]bool)
	for _, inst := range instansis {
		if inst.UserID != nil {
			instansiMap[*inst.UserID] = inst.IsVerified
		}
	}

	var result []UserListItem
	for _, u := range users {
		isVerified := false
		if u.Role == "instansi" {
			isVerified = instansiMap[u.ID]
		} else {
			isVerified = true // student is verified by default
		}
		result = append(result, UserListItem{
			ID:         u.ID,
			Name:       u.Name,
			Email:      u.Email,
			Role:       u.Role,
			Keahlian:   u.Keahlian,
			IsVerified: isVerified,
			CreatedAt:  u.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// 7. GET ADMIN STATS
func GetAdminStats(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var totalUsers int64
	koneksi.DB.Model(&models.User{}).Count(&totalUsers)

	var pendingVerifications int64
	koneksi.DB.Model(&models.Instansi{}).Where("is_verified = ?", false).Count(&pendingVerifications)

	// We can also count pending beasiswa / olimpiade verifications
	var pendingBeasiswas int64
	koneksi.DB.Model(&models.Beasiswa{}).Where("verified_by IS NULL").Count(&pendingBeasiswas)

	var pendingOlimpiades int64
	koneksi.DB.Model(&models.Olimpiade{}).Where("verified_by IS NULL").Count(&pendingOlimpiades)

	// Combine to pending verifications queue count
	totalPendingQueue := pendingVerifications + pendingBeasiswas + pendingOlimpiades

	c.JSON(http.StatusOK, gin.H{
		"total_users":          totalUsers,
		"pending_verify":       pendingVerifications,
		"pending_queue_count":  totalPendingQueue,
		"reported_content":    18, // Mocked as static or count of flags
	})
}

// 8. GET VERIFICATION QUEUE
type QueueItem struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Type           string `json:"type"` // "Partner Account", "Scholarship Content", "Competition Content"
	SubmissionDate string `json:"submission_date"`
	Status         string `json:"status"` // "PENDING"
}

func GetVerificationQueue(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var queue []QueueItem

	// 1. Fetch unverified instansis
	var instansis []models.Instansi
	koneksi.DB.Where("is_verified = ?", false).Find(&instansis)
	for _, inst := range instansis {
		queue = append(queue, QueueItem{
			ID:             inst.ID,
			Name:           inst.Nama,
			Type:           "Partner Account",
			SubmissionDate: inst.CreatedAt.Format("02 Jan 2006"),
			Status:         "PENDING",
		})
	}

	// 2. Fetch unverified beasiswas
	var beasiswas []models.Beasiswa
	koneksi.DB.Where("verified_by IS NULL").Find(&beasiswas)
	for _, b := range beasiswas {
		// Get instansi name for provider
		var instName string = "Private Foundation"
		if b.InstansiID != nil {
			var inst models.Instansi
			if err := koneksi.DB.First(&inst, b.InstansiID).Error; err == nil {
				instName = inst.Nama
			}
		}
		queue = append(queue, QueueItem{
			ID:             b.ID,
			Name:           b.Nama + " (" + instName + ")",
			Type:           "Scholarship Content",
			SubmissionDate: b.CreatedAt.Format("02 Jan 2006"),
			Status:         "PENDING",
		})
	}

	// 3. Fetch unverified olimpiades
	var olimpiades []models.Olimpiade
	koneksi.DB.Where("verified_by IS NULL").Find(&olimpiades)
	for _, o := range olimpiades {
		var instName string = "Academic Institution"
		if o.InstansiID != nil {
			var inst models.Instansi
			if err := koneksi.DB.First(&inst, o.InstansiID).Error; err == nil {
				instName = inst.Nama
			}
		}
		queue = append(queue, QueueItem{
			ID:             o.ID,
			Name:           o.Judul + " (" + instName + ")",
			Type:           "Competition Content",
			SubmissionDate: o.CreatedAt.Format("02 Jan 2006"),
			Status:         "PENDING",
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": queue})
}