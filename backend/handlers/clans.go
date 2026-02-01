package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetClans(w http.ResponseWriter, r *http.Request) {
	var clans []models.Clan
	withMembers := r.URL.Query().Get("members") == "true"

	query := database.DB.Order("experience DESC")
	if withMembers {
		query = query.Preload("Members")
	}

	if err := query.Find(&clans).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for i := range clans {
		clans[i].Rank = i + 1
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clans)
}

func GetClan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var clan models.Clan
	if err := database.DB.Preload("Members").First(&clan, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var rank int64
	database.DB.Model(&models.Clan{}).Where("experience > ?", clan.Experience).Count(&rank)
	clan.Rank = int(rank) + 1

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clan)
}

func CreateClan(w http.ResponseWriter, r *http.Request) {
	var clan models.Clan
	if err := json.NewDecoder(r.Body).Decode(&clan); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&clan).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(clan)
}

func UpdateClan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var clan models.Clan
	if err := database.DB.First(&clan, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&clan); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	clan.ID = uint(id)

	if err := database.DB.Save(&clan).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clan)
}

func DeleteClan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	database.DB.Where("clan_id = ?", id).Delete(&models.ClanMember{})
	database.DB.Model(&models.Player{}).Where("clan_id = ?", id).Update("clan_id", nil)
	if err := database.DB.Delete(&models.Clan{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
