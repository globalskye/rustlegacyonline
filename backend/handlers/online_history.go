package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func GetOnlineHistory(w http.ResponseWriter, r *http.Request) {
	hoursStr := r.URL.Query().Get("hours")
	hours := 24
	if h, err := strconv.Atoi(hoursStr); err == nil && h > 0 && h <= 168 {
		hours = h
	}
	serverType := r.URL.Query().Get("type")

	since := time.Now().Add(-time.Duration(hours) * time.Hour)
	var records []models.OnlineHistory
	q := database.DB.Where("recorded_at >= ?", since)
	if serverType != "" {
		q = q.Where("server_type = ?", serverType)
	}
	if err := q.Order("recorded_at ASC").Find(&records).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}
