package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/gameserver"
)

func GetServerStatusClassic(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, "classic")
}

func GetServerStatusDeathmatch(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, "deathmatch")
}

func GetServerStatus(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, r.URL.Query().Get("type"))
}

func getServerStatusByType(w http.ResponseWriter, serverType string) {

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
		// Prefer reported online from plugin (PlayerClient.All), fallback to A2S_INFO
		info := gameserver.Query(server.IP, server.Port)
		currentPlayers := info.Players
		if reported, ok := getReportedOnline(server.Type); ok {
			currentPlayers = reported
		}

		var players []models.Player
		if reportedPlayers, ok := getReportedOnlinePlayers(server.Type); ok {
			for _, p := range reportedPlayers {
				players = append(players, models.Player{
					SteamID:       p.SteamID,
					Username:      p.Username,
					IsOnline:      true,
				})
			}
		}
		if len(players) == 0 {
			database.DB.Where("is_online = ?", true).Limit(10).Find(&players)
		}

		status := models.ServerStatus{
			ServerID:       server.ID,
			ServerName:     server.Name,
			ServerType:     server.Type,
			IsOnline:       info.Status == "Online" || currentPlayers > 0,
			CurrentPlayers: currentPlayers,
			MaxPlayers:     info.MaxPlayers,
			Map:            info.Map,
			Uptime:         0,
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
