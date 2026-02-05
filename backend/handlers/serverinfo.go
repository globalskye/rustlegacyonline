package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetServerInfo(w http.ResponseWriter, r *http.Request) {
	var serverInfo models.ServerInfo
	var descriptions []models.Description
	var downloadLinks []models.DownloadLink

	if err := database.DB.First(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	database.DB.Where("server_info_id = ?", serverInfo.ID).Find(&descriptions)
	database.DB.Where("server_info_id = ?", serverInfo.ID).Order("\"order\" ASC").Find(&downloadLinks)

	response := map[string]interface{}{
		"id":             serverInfo.ID,
		"name":           serverInfo.Name,
		"maxPlayers":     serverInfo.MaxPlayers,
		"gameVersion":    serverInfo.GameVersion,
		"downloadUrl":    serverInfo.DownloadURL,
		"virusTotalUrl":  serverInfo.VirusTotalURL,
		"type":           serverInfo.Type,
		"ip":             serverInfo.IP,
		"port":           serverInfo.Port,
		"descriptions":   descriptions,
		"downloadLinks":  downloadLinks,
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
	serverInfo.QueryPort = input.QueryPort

	if err := database.DB.Save(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serverInfo)
}

func GetAllServers(w http.ResponseWriter, r *http.Request) {
	var servers []models.ServerInfo
	if err := database.DB.Order("sort_order ASC, id ASC").Find(&servers).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(servers)
}

func CreateServer(w http.ResponseWriter, r *http.Request) {
	var input models.ServerInfo
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if input.Type == "" {
		input.Type = "classic"
	}
	if err := database.DB.Create(&input).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

func UpdateServer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var srv models.ServerInfo
	if err := database.DB.First(&srv, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	var input models.ServerInfo
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	srv.Name = input.Name
	srv.MaxPlayers = input.MaxPlayers
	srv.GameVersion = input.GameVersion
	srv.DownloadURL = input.DownloadURL
	srv.VirusTotalURL = input.VirusTotalURL
	srv.Type = input.Type
	srv.IP = input.IP
	srv.Port = input.Port
	srv.QueryPort = input.QueryPort
	srv.Order = input.Order
	if err := database.DB.Save(&srv).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(srv)
}

func DeleteServer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	if err := database.DB.Delete(&models.ServerInfo{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
