package models

import "time"

type Admin struct {
	ID       uint   `gorm:"primaryKey;column:id_admin" json:"id_admin"`
	Nama     string `gorm:"column:nama" json:"nama"`
	Email    string `gorm:"column:email" json:"email"`
	Password string `gorm:"column:password" json:"password"`
}
func (Admin) TableName() string { return "admin" }

type JenjangPendidikan struct {
	ID          uint   `gorm:"primaryKey;column:id_jenjang" json:"id_jenjang"`
	NamaJenjang string `gorm:"column:nama_jenjang" json:"nama_jenjang"`
	Kode        string `gorm:"column:kode" json:"kode"`
}
func (JenjangPendidikan) TableName() string { return "jenjang_pendidikan" }

type Kategori struct {
	ID           uint   `gorm:"primaryKey;column:id_kategori" json:"id_kategori"`
	NamaKategori string `gorm:"column:nama_kategori" json:"nama_kategori"`
	Tipe         string `gorm:"column:tipe" json:"tipe"`
	Slug         string `gorm:"column:slug" json:"slug"`
}
func (Kategori) TableName() string { return "kategori" }

type User struct {
	ID        uint   `gorm:"primaryKey;column:id_user" json:"id_user"`
	JenjangID uint   `gorm:"column:id_jenjang" json:"id_jenjang"`
	Nama      string `gorm:"column:nama" json:"nama"`
	Email     string `gorm:"column:email" json:"email"`
	Password  string `gorm:"column:password" json:"password"`
}
func (User) TableName() string { return "users" }

type Instansi struct {
	ID     uint   `gorm:"primaryKey;column:id_instansi" json:"id_instansi"`
	UserID uint   `gorm:"column:id_user" json:"id_user"`
	Nama   string `gorm:"column:nama" json:"nama"`
	Tipe   string `gorm:"column:tipe" json:"tipe"`
}
func (Instansi) TableName() string { return "instansi" }

type Olimpiade struct {
	ID               uint    `gorm:"primaryKey;column:id_olimpiade" json:"id_olimpiade"`
	InstansiID       uint    `gorm:"column:id_instansi" json:"id_instansi"`
	KategoriID       uint    `gorm:"column:id_kategori" json:"id_kategori"`
	JenjangID        uint    `gorm:"column:id_jenjang" json:"id_jenjang"`
	AdminID          uint    `gorm:"column:id_admin" json:"id_admin"`
	Judul            string  `gorm:"column:judul" json:"judul"`
	Deskripsi        string  `gorm:"column:deskripsi" json:"deskripsi"`
	TipeLomba        string  `gorm:"column:tipe_lomba" json:"tipe_lomba"`
	Kuota            int     `gorm:"column:kuota" json:"kuota"`
	BiayaPendaftaran float64 `gorm:"column:biaya_pendaftaran" json:"biaya_pendaftaran"`
	LinkPendaftaran  string  `gorm:"column:link_pendaftaran" json:"link_pendaftaran"`
}
func (Olimpiade) TableName() string { return "olimpiade" }

type Beasiswa struct {
	ID           uint    `gorm:"primaryKey;column:id_beasiswa" json:"id_beasiswa"`
	InstansiID   uint    `gorm:"column:id_instansi" json:"id_instansi"`
	KategoriID   uint    `gorm:"column:id_kategori" json:"id_kategori"`
	JenjangID    uint    `gorm:"column:id_jenjang" json:"id_jenjang"`
	AdminID      uint    `gorm:"column:id_admin" json:"id_admin"`
	Nama         string  `gorm:"column:nama" json:"nama"`
	TipeBeasiswa string  `gorm:"column:tipe_beasiswa" json:"tipe_beasiswa"`
	Nominal      float64 `gorm:"column:nominal" json:"nominal"` 
	LinkDaftar   string  `gorm:"column:link_daftar" json:"link_daftar"`
}
func (Beasiswa) TableName() string { return "beasiswa" }

type Pendaftaran struct {
	ID          uint      `gorm:"primaryKey;column:id_pendaftaran" json:"id_pendaftaran"`
	UserID      uint      `gorm:"column:id_user" json:"id_user"`
	BeasiswaID  *uint     `gorm:"column:id_beasiswa" json:"id_beasiswa"`
	OlimpiadeID *uint     `gorm:"column:id_olimpiade" json:"id_olimpiade"`
	TglDaftar   time.Time `gorm:"column:tgl_daftar" json:"tgl_daftar"`
	Status      string    `gorm:"column:status" json:"status"`
}
func (Pendaftaran) TableName() string { return "pendaftaran" }