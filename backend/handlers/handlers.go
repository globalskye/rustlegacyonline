package handlers

import (
	"encoding/json"
	"net/http"
	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"strconv"

	"github.com/gorilla/mux"
)

// ========================================
// SERVER INFO
// ========================================

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

	if err := database.DB.Save(&serverInfo).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(serverInfo)
}

// ========================================
// FEATURES
// ========================================

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
	id, _ := strconv.Atoi(vars["id"])

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
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.Feature{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// NEWS
// ========================================

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
	id, _ := strconv.Atoi(vars["id"])

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
	id, _ := strconv.Atoi(vars["id"])

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
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.News{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// HOW TO START STEPS
// ========================================

func GetHowToStartSteps(w http.ResponseWriter, r *http.Request) {
	var steps []models.HowToStartStep
	lang := r.URL.Query().Get("lang")

	query := database.DB.Order("step_number ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}

	if err := query.Find(&steps).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(steps)
}

func CreateHowToStartStep(w http.ResponseWriter, r *http.Request) {
	var step models.HowToStartStep
	if err := json.NewDecoder(r.Body).Decode(&step); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&step).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(step)
}

func UpdateHowToStartStep(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var step models.HowToStartStep
	if err := database.DB.First(&step, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&step); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&step).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(step)
}

func DeleteHowToStartStep(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.HowToStartStep{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// SERVER DETAILS
// ========================================

func GetServerDetails(w http.ResponseWriter, r *http.Request) {
	var details []models.ServerDetail
	lang := r.URL.Query().Get("lang")
	section := r.URL.Query().Get("section")

	query := database.DB.Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}
	if section != "" {
		query = query.Where("section = ?", section)
	}

	if err := query.Find(&details).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(details)
}

func CreateServerDetail(w http.ResponseWriter, r *http.Request) {
	var detail models.ServerDetail
	if err := json.NewDecoder(r.Body).Decode(&detail); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&detail).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(detail)
}

func UpdateServerDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var detail models.ServerDetail
	if err := database.DB.First(&detail, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&detail); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&detail).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(detail)
}

func DeleteServerDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.ServerDetail{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// PLUGINS
// ========================================

func GetPlugins(w http.ResponseWriter, r *http.Request) {
	var plugins []models.Plugin
	lang := r.URL.Query().Get("lang")

	query := database.DB.Preload("Commands").Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
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

	// Delete commands first
	database.DB.Where("plugin_id = ?", id).Delete(&models.Command{})
	
	if err := database.DB.Delete(&models.Plugin{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// COMMANDS
// ========================================

func CreateCommand(w http.ResponseWriter, r *http.Request) {
	var command models.Command
	if err := json.NewDecoder(r.Body).Decode(&command); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&command).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(command)
}

func UpdateCommand(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var command models.Command
	if err := database.DB.First(&command, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&command); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&command).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(command)
}

func DeleteCommand(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.Command{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// RULES
// ========================================

func GetRules(w http.ResponseWriter, r *http.Request) {
	var rules []models.Rule
	lang := r.URL.Query().Get("lang")

	query := database.DB.Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}

	if err := query.Find(&rules).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rules)
}

func CreateRule(w http.ResponseWriter, r *http.Request) {
	var rule models.Rule
	if err := json.NewDecoder(r.Body).Decode(&rule); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&rule).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rule)
}

func UpdateRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var rule models.Rule
	if err := database.DB.First(&rule, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&rule); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&rule).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rule)
}

func DeleteRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.Rule{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// PAYMENT METHODS
// ========================================

func GetPaymentMethods(w http.ResponseWriter, r *http.Request) {
	var methods []models.PaymentMethod
	
	if err := database.DB.Order("\"order\" ASC").Find(&methods).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(methods)
}

func CreatePaymentMethod(w http.ResponseWriter, r *http.Request) {
	var method models.PaymentMethod
	if err := json.NewDecoder(r.Body).Decode(&method); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&method).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(method)
}

func UpdatePaymentMethod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var method models.PaymentMethod
	if err := database.DB.First(&method, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&method); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&method).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(method)
}

func DeletePaymentMethod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.PaymentMethod{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// LEGAL DOCUMENTS
// ========================================

func GetLegalDocuments(w http.ResponseWriter, r *http.Request) {
	var docs []models.LegalDocument
	lang := r.URL.Query().Get("lang")
	docType := r.URL.Query().Get("type")

	query := database.DB
	if lang != "" {
		query = query.Where("language = ?", lang)
	}
	if docType != "" {
		query = query.Where("type = ?", docType)
	}

	if err := query.Find(&docs).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(docs)
}

func CreateLegalDocument(w http.ResponseWriter, r *http.Request) {
	var doc models.LegalDocument
	if err := json.NewDecoder(r.Body).Decode(&doc); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&doc).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(doc)
}

func UpdateLegalDocument(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var doc models.LegalDocument
	if err := database.DB.First(&doc, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&doc); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&doc).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doc)
}

func DeleteLegalDocument(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.LegalDocument{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========================================
// PLAYERS
// ========================================

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

// ========================================
// HEALTH CHECK
// ========================================

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}