package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetPlayers(w http.ResponseWriter, r *http.Request) {
	var players []models.Player
	onlineOnly := r.URL.Query().Get("online") == "true"
	clanID := r.URL.Query().Get("clanId")
	withStats := r.URL.Query().Get("stats") == "true"

	query := database.DB.Order("killed_players DESC").Preload("Clan")
	if onlineOnly {
		query = query.Where("is_online = ?", true)
	}
	if clanID != "" {
		query = query.Where("clan_id = ?", clanID)
	}

	if err := query.Find(&players).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for i := range players {
		players[i].RankPosition = i + 1
		if withStats {
			var stats models.PlayerStats
			if err := database.DB.Where("steam_id = ?", players[i].SteamID).First(&stats).Error; err == nil {
				players[i].Stats = &stats
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

func GetPlayer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	steamID := vars["steamid"]

	var player models.Player
	if err := database.DB.Preload("Clan").Where("steam_id = ?", steamID).First(&player).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var rank int64
	database.DB.Model(&models.Player{}).Where("killed_players > ?", player.KilledPlayers).Count(&rank)
	player.RankPosition = int(rank) + 1

	// Load extended stats
	var stats models.PlayerStats
	if err := database.DB.Where("steam_id = ?", steamID).First(&stats).Error; err == nil {
		player.Stats = &stats
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(player)
}
