package handlers

import (
	"encoding/json"
	"net/http"
	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"strconv"

	"github.com/gorilla/mux"
)

// ServerInfo handlers
func GetServerInfo(w http.ResponseWriter, r *http.Request) {
	var serverInfo models.ServerInfo
	var descriptions []models.Description

	// Получаем информацию о сервере
	if err := database.DB.First(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Получаем описания
	database.DB.Where("server_info_id = ?", serverInfo.ID).Find(&descriptions)

	// Формируем ответ
	response := map[string]interface{}{
		"id":          serverInfo.ID,
		"name":        serverInfo.Name,
		"maxPlayers":  serverInfo.MaxPlayers,
		"gameVersion": serverInfo.GameVersion,
		"downloadUrl": serverInfo.DownloadURL,
		"descriptions": descriptions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateServerInfo(w http.ResponseWriter, r *http.Request) {
	var serverInfo models.ServerInfo

	if err := json.NewDecoder(r.Body).Decode(&serverInfo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serverInfo)
}

// Features handlers
func GetFeatures(w http.ResponseWriter, r *http.Request) {
	var features []models.Feature
	lang := r.URL.Query().Get("lang")

	query := database.DB.Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}

	if err := query.Find(&features).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(features)
}

func CreateFeature(w http.ResponseWriter, r *http.Request) {
	var feature models.Feature

	if err := json.NewDecoder(r.Body).Decode(&feature); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&feature).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(feature)
}

func UpdateFeature(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var feature models.Feature
	if err := database.DB.First(&feature, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&feature); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&feature).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feature)
}

func DeleteFeature(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := database.DB.Delete(&models.Feature{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// News handlers
func GetNews(w http.ResponseWriter, r *http.Request) {
	var news []models.News
	lang := r.URL.Query().Get("lang")
	publishedOnly := r.URL.Query().Get("published") == "true"

	query := database.DB.Order("published_at DESC")
	
	if lang != "" {
		query = query.Where("language = ?", lang)
	}
	
	if publishedOnly {
		query = query.Where("published = ?", true)
	}

	if err := query.Find(&news).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(news)
}

func GetNewsItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var newsItem models.News
	if err := database.DB.First(&newsItem, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newsItem)
}

func CreateNews(w http.ResponseWriter, r *http.Request) {
	var newsItem models.News

	if err := json.NewDecoder(r.Body).Decode(&newsItem); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&newsItem).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newsItem)
}

func UpdateNews(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var newsItem models.News
	if err := database.DB.First(&newsItem, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&newsItem); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&newsItem).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newsItem)
}

func DeleteNews(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := database.DB.Delete(&models.News{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Players handlers
func GetPlayers(w http.ResponseWriter, r *http.Request) {
	var players []models.Player
	onlineOnly := r.URL.Query().Get("online") == "true"

	query := database.DB.Order("play_time DESC")
	
	if onlineOnly {
		query = query.Where("is_online = ?", true)
	}

	if err := query.Find(&players).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

func GetPlayer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	steamID := vars["steamid"]

	var player models.Player
	if err := database.DB.Where("steam_id = ?", steamID).First(&player).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(player)
}

// Health check
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
