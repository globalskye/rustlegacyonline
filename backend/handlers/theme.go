package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func GetTheme(w http.ResponseWriter, r *http.Request) {
	var theme models.Theme

	if err := database.DB.Where("is_active = ?", true).First(&theme).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(theme)
}

func UpdateTheme(w http.ResponseWriter, r *http.Request) {
	var input models.Theme
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var theme models.Theme
	if err := database.DB.Where("is_active = ?", true).First(&theme).Error; err != nil {
		input.IsActive = true
		if err := database.DB.Create(&input).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(input)
		return
	}

	theme.Name = input.Name
	theme.PrimaryColor = input.PrimaryColor
	theme.AccentColor = input.AccentColor
	theme.BackgroundColor = input.BackgroundColor
	theme.CardBackground = input.CardBackground
	theme.TextPrimary = input.TextPrimary
	theme.TextSecondary = input.TextSecondary
	theme.BorderColor = input.BorderColor
	theme.GlowColor = input.GlowColor

	if err := database.DB.Save(&theme).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(theme)
}
