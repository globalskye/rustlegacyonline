package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetDownloadLinks(w http.ResponseWriter, r *http.Request) {
	serverID := r.URL.Query().Get("serverId")
	var links []models.DownloadLink
	query := database.DB.Order("\"order\" ASC")
	if serverID != "" {
		id, _ := strconv.Atoi(serverID)
		query = query.Where("server_info_id = ?", id)
	}
	if err := query.Find(&links).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(links)
}

func CreateDownloadLink(w http.ResponseWriter, r *http.Request) {
	var link models.DownloadLink
	if err := json.NewDecoder(r.Body).Decode(&link); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := database.DB.Create(&link).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(link)
}

func UpdateDownloadLink(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var link models.DownloadLink
	if err := database.DB.First(&link, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&link); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	link.ID = uint(id)
	if err := database.DB.Save(&link).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(link)
}

func DeleteDownloadLink(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	if err := database.DB.Delete(&models.DownloadLink{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
