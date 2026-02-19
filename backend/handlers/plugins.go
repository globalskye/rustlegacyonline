package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetPlugins(w http.ResponseWriter, r *http.Request) {
	var plugins []models.Plugin
	lang := r.URL.Query().Get("lang")
	serverIDStr := r.URL.Query().Get("serverId")

	query := database.DB.Preload("Commands").Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}
	if serverIDStr != "" {
		if serverID, err := strconv.ParseUint(serverIDStr, 10, 32); err == nil && serverID > 0 {
			query = query.Where("server_id = ? OR server_id = 0", serverID)
		}
	}

	if err := query.Find(&plugins).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plugins)
}

func CreatePlugin(w http.ResponseWriter, r *http.Request) {
	var plugin models.Plugin
	if err := json.NewDecoder(r.Body).Decode(&plugin); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&plugin).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plugin)
}

func UpdatePlugin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var plugin models.Plugin
	if err := database.DB.First(&plugin, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&plugin); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&plugin).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plugin)
}

func DeletePlugin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	database.DB.Where("plugin_id = ?", id).Delete(&models.Command{})

	if err := database.DB.Delete(&models.Plugin{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
