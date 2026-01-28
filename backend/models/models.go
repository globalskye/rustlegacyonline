package models

import (
	"time"
)

// ServerInfo - основная информация о сервере
type ServerInfo struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	MaxPlayers   int       `json:"maxPlayers"`
	GameVersion  string    `json:"gameVersion"`
	DownloadURL  string    `json:"downloadUrl"`
	VirusTotalURL string   `json:"virusTotalUrl"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// Description - описание сервера на разных языках
type Description struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	ServerInfoID uint   `json:"serverInfoId"`
	Language     string `json:"language"` // "en" или "ru"
	Content      string `json:"content" gorm:"type:text"`
}

// Feature - особенности сервера
type Feature struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ServerInfoID uint      `json:"serverInfoId"`
	Language     string    `json:"language"`
	Title        string    `json:"title"`
	Description  string    `json:"description" gorm:"type:text"`
	Icon         string    `json:"icon"`
	Order        int       `json:"order"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// News - новости
type News struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Language    string    `json:"language"`
	Title       string    `json:"title"`
	Content     string    `json:"content" gorm:"type:text"`
	ImageURL    string    `json:"imageUrl"`
	Published   bool      `json:"published"`
	PublishedAt time.Time `json:"publishedAt"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// HowToStartStep - шаги "Как начать играть"
type HowToStartStep struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Language    string    `json:"language"`
	StepNumber  int       `json:"stepNumber"`
	Title       string    `json:"title"`
	Content     string    `json:"content" gorm:"type:text"`
	ImageURL    string    `json:"imageUrl"`
	VideoURL    string    `json:"videoUrl"` // Ссылка на YouTube
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ServerDetail - детальная информация о сервере (описание, характеристики)
type ServerDetail struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Language  string    `json:"language"`
	Section   string    `json:"section"` // "description" или "features"
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	ImageURL  string    `json:"imageUrl"`
	VideoURL  string    `json:"videoUrl"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Plugin - плагины сервера
type Plugin struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Language    string    `json:"language"`
	Name        string    `json:"name"`
	Description string    `json:"description" gorm:"type:text"`
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Commands    []Command `gorm:"foreignKey:PluginID" json:"commands"`
}

// Command - команды плагинов
type Command struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	PluginID    uint   `json:"pluginId"`
	Command     string `json:"command"`
	Description string `json:"description" gorm:"type:text"`
	Usage       string `json:"usage"`
}

// Rule - правила сервера
type Rule struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Language  string    `json:"language"`
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// PaymentMethod - методы оплаты
type PaymentMethod struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"imageUrl"`
	Order    int    `json:"order"`
	Enabled  bool   `json:"enabled"`
}

// LegalDocument - юридические документы
type LegalDocument struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Language  string    `json:"language"`
	Type      string    `json:"type"` // "terms", "privacy", "company_info"
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Player - игроки
type Player struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Username    string    `json:"username"`
	SteamID     string    `json:"steamId" gorm:"uniqueIndex"`
	PlayTime    int       `json:"playTime"` // в минутах
	LastSeen    time.Time `json:"lastSeen"`
	FirstJoined time.Time `json:"firstJoined"`
	IsOnline    bool      `json:"isOnline"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Setting - настройки
type Setting struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `json:"key" gorm:"uniqueIndex"`
	Value     string    `json:"value" gorm:"type:text"`
	UpdatedAt time.Time `json:"updatedAt"`
}