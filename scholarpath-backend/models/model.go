package models

import "time"

type User struct {
	ID              uint      `gorm:"primaryKey;column:id" json:"id"`
	JenjangID       *uint     `gorm:"column:jenjang_id" json:"jenjang_id"` // Pointer agar bisa null
	Name            string    `gorm:"column:name" json:"name"`
	Email           string    `gorm:"column:email" json:"email"`
	EmailVerifiedAt *time.Time`gorm:"column:email_verified_at" json:"email_verified_at"`
	Password        string    `gorm:"column:password" json:"password"`
	Role            string    `gorm:"column:role;default:student" json:"role"` // admin / student
	Keahlian string `gorm:"column:keahlian" json:"keahlian"`
	RememberToken   string    `gorm:"column:remember_token" json:"remember_token"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

type JenjangPendidikan struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Nama      string    `gorm:"column:nama" json:"nama"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}
func (JenjangPendidikan) TableName() string { return "jenjang_pendidikans" }

type Kategori struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Nama      string    `gorm:"column:nama" json:"nama"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

type Instansi struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID    *uint     `gorm:"column:user_id" json:"user_id"`
	Nama      string    `gorm:"column:nama" json:"nama"`
	Alamat    string    `gorm:"column:alamat" json:"alamat"`
	Kontak    string    `gorm:"column:kontak" json:"kontak"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

type Olimpiade struct {
	ID               uint      `gorm:"primaryKey;column:id" json:"id"`
	InstansiID       *uint     `gorm:"column:instansi_id" json:"instansi_id"`
	KategoriID       *uint     `gorm:"column:kategori_id" json:"kategori_id"`
	JenjangID        *uint     `gorm:"column:jenjang_id" json:"jenjang_id"`
	VerifiedBy       *uint     `gorm:"column:verified_by" json:"verified_by"`
	Judul            string    `gorm:"column:judul" json:"judul"`
	Deskripsi        string    `gorm:"column:deskripsi" json:"deskripsi"`
	TipeLomba        string    `gorm:"column:tipe_lomba" json:"tipe_lomba"`
	Kuota            int       `gorm:"column:kuota" json:"kuota"`
	BiayaPendaftaran float64   `gorm:"column:biaya_pendaftaran" json:"biaya_pendaftaran"`
	LinkInformasi    string    `gorm:"column:link_informasi" json:"link_informasi"`
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

type Beasiswa struct {
	ID               uint      `gorm:"primaryKey;column:id" json:"id"`
	InstansiID       *uint     `gorm:"column:instansi_id" json:"instansi_id"`
	KategoriID       *uint     `gorm:"column:kategori_id" json:"kategori_id"`
	JenjangID        *uint     `gorm:"column:jenjang_id" json:"jenjang_id"`
	VerifiedBy       *uint     `gorm:"column:verified_by" json:"verified_by"`
	Nama             string    `gorm:"column:nama" json:"nama"`
	Deskripsi        string    `gorm:"column:deskripsi" json:"deskripsi"`
	KuotaPendaftar   int       `gorm:"column:kuota_pendaftar" json:"kuota_pendaftar"`
	TipeBeasiswa     string    `gorm:"column:tipe_beasiswa" json:"tipe_beasiswa"`
	NominalPendanaan float64   `gorm:"column:nominal_pendanaan" json:"nominal_pendanaan"`
	LinkInformasi    string    `gorm:"column:link_informasi" json:"link_informasi"`
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

type Pendaftaran struct {
	ID            uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID        uint     `gorm:"column:user_id" json:"user_id"`
	BeasiswaID    *uint     `gorm:"column:beasiswa_id" json:"beasiswa_id"`
	OlimpiadeID   *uint     `gorm:"column:olimpiade_id" json:"olimpiade_id"`
	StatusID      *uint     `gorm:"column:status_id" json:"status_id"`
	TanggalDaftar time.Time `gorm:"column:tanggal_daftar;default:CURRENT_TIMESTAMP" json:"tanggal_daftar"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}