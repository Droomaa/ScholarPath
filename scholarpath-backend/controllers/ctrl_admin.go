package controllers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"scholarpath-backend/koneksi"
	"scholarpath-backend/models"
	"strconv"
	"time"

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

// 6. GET ADMIN STATS
func GetAdminStats(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	var totalStudents int64
	var totalInstitutions int64
	var pendingInstansi int64
	var reportedContent int64

	koneksi.DB.Model(&models.User{}).Where("role = ?", "student").Count(&totalStudents)
	koneksi.DB.Model(&models.User{}).Where("role = ?", "instansi").Count(&totalInstitutions)
	koneksi.DB.Model(&models.Instansi{}).Where("is_verified = ?", false).Count(&pendingInstansi)
	koneksi.DB.Model(&models.Report{}).Count(&reportedContent)

	var registrationTrend [7]int64
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	for i := 6; i >= 0; i-- {
		startOfDay := startOfToday.AddDate(0, 0, -i)
		endOfDay := startOfDay.AddDate(0, 0, 1)

		var count int64
		koneksi.DB.Model(&models.Instansi{}).
			Where("created_at >= ? AND created_at < ?", startOfDay, endOfDay).
			Count(&count)
		registrationTrend[6-i] = count
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"totalStudents": totalStudents,
			"totalInstitutions": totalInstitutions,
			"pendingVerifications": pendingInstansi,
			"reportedContent": reportedContent,
			"registrationTrend": registrationTrend,
		},
	})
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

<<<<<<< Updated upstream
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
=======
// 7. GET PENDING VERIFICATIONS QUEUE
func GetPendingVerificationsQueue(c *gin.Context) {
>>>>>>> Stashed changes
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

<<<<<<< Updated upstream
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
=======
	type QueueItem struct {
		ID       string `json:"id"`
		Entity   string `json:"entity"`
		Provider string `json:"provider"`
		Type     string `json:"type"`
		Date     string `json:"date"`
		Status   string `json:"status"`
		Initial  string `json:"initial"`
		Color    string `json:"color"`
	}

	var items []QueueItem

	var instansis []models.Instansi
	koneksi.DB.Where("is_verified = ?", false).Find(&instansis)
	for _, inst := range instansis {
		initial := "I"
		if len(inst.Nama) > 0 {
			initial = string(inst.Nama[0])
		}
		items = append(items, QueueItem{
			ID: "INST-" + fmt.Sprintf("%d", inst.ID),
			Entity: inst.Nama,
			Provider: "Academic Institution",
			Type: "Partner Account",
			Date: inst.CreatedAt.Format("Jan 02, 2006"),
			Status: "PENDING",
			Initial: initial,
			Color: "green",
		})
	}

	// Beasiswa
	var beasiswas []models.Beasiswa
	koneksi.DB.Where("verified_by IS NULL").Find(&beasiswas)
	for _, b := range beasiswas {
		providerName := "Private Foundation"
		if b.InstansiID != nil {
			providerName = "Instansi Terdaftar"
		}
		initial := "S"
		if len(b.Nama) > 0 {
			initial = string(b.Nama[0])
		}
		items = append(items, QueueItem{
			ID: "BEA-" + fmt.Sprintf("%d", b.ID),
			Entity: b.Nama,
			Provider: providerName,
			Type: "Scholarship Content",
			Date: b.CreatedAt.Format("Jan 02, 2006"),
			Status: "PENDING",
			Initial: initial,
			Color: "blue",
		})
	}

	// Olimpiade
	var olimpiades []models.Olimpiade
	koneksi.DB.Where("verified_by IS NULL").Find(&olimpiades)
	for _, o := range olimpiades {
		providerName := "Event Organizer"
		if o.InstansiID != nil {
			providerName = "Instansi Terdaftar"
		}
		initial := "C"
		if len(o.Judul) > 0 {
			initial = string(o.Judul[0])
		}
		items = append(items, QueueItem{
			ID: "OLI-" + fmt.Sprintf("%d", o.ID),
			Entity: o.Judul,
			Provider: providerName,
			Type: "Competition Content",
			Date: o.CreatedAt.Format("Jan 02, 2006"),
			Status: "PENDING",
			Initial: initial,
			Color: "purple",
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}

// 8. EXPORT ADMIN REPORT CSV
func ExportAdminReport(c *gin.Context) {
	_, isAllowed := enforceAdminRole(c)
	if !isAllowed {
		return
	}

	c.Writer.Header().Set("Content-Type", "text/csv")
	c.Writer.Header().Set("Content-Disposition", "attachment;filename=admin_report.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Header
	writer.Write([]string{"ID", "Nama Instansi", "Alamat", "Kontak", "Status Terverifikasi", "Tanggal Bergabung"})

	var instansis []models.Instansi
	koneksi.DB.Find(&instansis)

	for _, inst := range instansis {
		status := "Pending"
		if inst.IsVerified {
			status = "Verified"
		}
		writer.Write([]string{
			strconv.Itoa(int(inst.ID)),
			inst.Nama,
			inst.Alamat,
			inst.Kontak,
			status,
			inst.CreatedAt.Format("2006-01-02"),
		})
	}
>>>>>>> Stashed changes
}