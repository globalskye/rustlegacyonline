package onlinehistory

import (
	"log"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/gameserver"
)

// Collect runs every 5 minutes, queries servers and saves online history
func Collect() {
	var servers []models.ServerInfo
	if err := database.DB.Find(&servers).Error; err != nil {
		log.Printf("[OnlineHistory] failed to list servers: %v", err)
		return
	}
	now := time.Now()
	for _, srv := range servers {
		info := gameserver.Query(srv.IP, srv.Port, srv.QueryPort)
		rec := models.OnlineHistory{
			ServerID:   srv.ID,
			ServerType: srv.Type,
			Players:    info.Players,
			RecordedAt: now,
		}
		if err := database.DB.Create(&rec).Error; err != nil {
			log.Printf("[OnlineHistory] save failed: %v", err)
		}
	}
}
