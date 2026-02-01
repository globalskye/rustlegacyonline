package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func GetServerInfo(w http.ResponseWriter, r *http.Request) {
	var serverInfo models.ServerInfo
	var descriptions []models.Description

	if err := database.DB.First(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	database.DB.Where("server_info_id = ?", serverInfo.ID).Find(&descriptions)

	response := map[string]interface{}{
		"id":            serverInfo.ID,
		"name":          serverInfo.Name,
		"maxPlayers":    serverInfo.MaxPlayers,
		"gameVersion":   serverInfo.GameVersion,
		"downloadUrl":   serverInfo.DownloadURL,
		"virusTotalUrl": serverInfo.VirusTotalURL,
		"type":          serverInfo.Type,
		"ip":            serverInfo.IP,
		"port":          serverInfo.Port,
		"descriptions":  descriptions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateServerInfo(w http.ResponseWriter, r *http.Request) {
	var input models.ServerInfo
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var serverInfo models.ServerInfo
	if err := database.DB.First(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	serverInfo.Name = input.Name
	serverInfo.MaxPlayers = input.MaxPlayers
	serverInfo.GameVersion = input.GameVersion
	serverInfo.DownloadURL = input.DownloadURL
	serverInfo.VirusTotalURL = input.VirusTotalURL
	serverInfo.Type = input.Type
	serverInfo.IP = input.IP
	serverInfo.Port = input.Port

	if err := database.DB.Save(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serverInfo)
}

func GetAllServers(w http.ResponseWriter, r *http.Request) {
	var servers []models.ServerInfo

	if err := database.DB.Find(&servers).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(servers)
}
