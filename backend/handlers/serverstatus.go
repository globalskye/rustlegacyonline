package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/gameserver"
)

func GetServerStatus(w http.ResponseWriter, r *http.Request) {
	serverType := r.URL.Query().Get("type")

	var servers []models.ServerInfo
	query := database.DB
	if serverType != "" {
		query = query.Where("type = ?", serverType)
	}

	if err := query.Find(&servers).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var statuses []models.ServerStatus
	for _, server := range servers {
		// Query live status via Source engine A2S_INFO
		info := gameserver.Query(server.IP, server.Port)

		var players []models.Player
		database.DB.Where("is_online = ?", true).Limit(10).Find(&players)

		status := models.ServerStatus{
			ServerID:       server.ID,
			ServerName:     server.Name,
			ServerType:     server.Type,
			IsOnline:       info.Status == "Online",
			CurrentPlayers: info.Players,
			MaxPlayers:     info.MaxPlayers,
			Map:            info.Map,
			Uptime:         0, // Source engine doesn't expose uptime in A2S_INFO
			IP:             server.IP,
			Port:           server.Port,
			ActivePlayers:  players,
		}
		if info.Map == "" {
			status.Map = "Unknown"
		}
		statuses = append(statuses, status)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}
