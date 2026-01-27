package models

import (
	"time"
)

type ServerInfo struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	MaxPlayers  int       `json:"maxPlayers"`
	GameVersion string    `json:"gameVersion"`
	DownloadURL string    `json:"downloadUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Description struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	ServerInfoID uint   `json:"serverInfoId"`
	Language     string `json:"language"` // "en" или "ru"
	Content      string `json:"content"`
}

type Feature struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ServerInfoID uint      `json:"serverInfoId"`
	Language     string    `json:"language"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Icon         string    `json:"icon"` // название иконки
	Order        int       `json:"order"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

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

type Player struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `json:"username"`
	SteamID      string    `json:"steamId" gorm:"uniqueIndex"`
	PlayTime     int       `json:"playTime"` // в минутах
	LastSeen     time.Time `json:"lastSeen"`
	FirstJoined  time.Time `json:"firstJoined"`
	IsOnline     bool      `json:"isOnline"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Setting struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `json:"key" gorm:"uniqueIndex"`
	Value     string    `json:"value" gorm:"type:text"`
	UpdatedAt time.Time `json:"updatedAt"`
}
