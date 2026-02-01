package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func GetFontSettings(w http.ResponseWriter, r *http.Request) {
	var fonts models.FontSettings

	if err := database.DB.First(&fonts).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fonts)
}

func UpdateFontSettings(w http.ResponseWriter, r *http.Request) {
	var input models.FontSettings
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var fonts models.FontSettings
	if err := database.DB.First(&fonts).Error; err != nil {
		if err := database.DB.Create(&input).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(input)
		return
	}

	fonts.HeadingFont = input.HeadingFont
	fonts.BodyFont = input.BodyFont
	fonts.H1Size = input.H1Size
	fonts.H2Size = input.H2Size
	fonts.H3Size = input.H3Size
	fonts.BodySize = input.BodySize

	if err := database.DB.Save(&fonts).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fonts)
}
