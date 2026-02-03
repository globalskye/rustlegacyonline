package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"

	"github.com/gorilla/mux"
)

func GetShopCategories(w http.ResponseWriter, r *http.Request) {
	var categories []models.ShopCategory
	lang := r.URL.Query().Get("lang")

	query := database.DB.Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}

	if err := query.Find(&categories).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func CreateShopCategory(w http.ResponseWriter, r *http.Request) {
	var category models.ShopCategory
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Create(&category).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

func UpdateShopCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var category models.ShopCategory
	if err := database.DB.First(&category, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := database.DB.Save(&category).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

func DeleteShopCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.ShopCategory{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetShopItems(w http.ResponseWriter, r *http.Request) {
	var items []models.ShopItem
	lang := r.URL.Query().Get("lang")
	categoryID := r.URL.Query().Get("categoryId")

	query := database.DB.Order("\"order\" ASC")
	if lang != "" {
		query = query.Where("language = ?", lang)
	}
	if categoryID != "" {
		catID, _ := strconv.Atoi(categoryID)
		query = query.Where("category_id = ?", catID)
	}

	if err := query.Find(&items).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	type ItemResponse struct {
		models.ShopItem
		Features []string `json:"features"`
	}

	var response []ItemResponse
	for _, item := range items {
		itemResp := ItemResponse{ShopItem: item}
		if item.Features != "" {
			json.Unmarshal([]byte(item.Features), &itemResp.Features)
		}
		response = append(response, itemResp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func CreateShopItem(w http.ResponseWriter, r *http.Request) {
	var input struct {
		models.ShopItem
		Features []string `json:"features"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(input.Features) > 0 {
		featuresJSON, _ := json.Marshal(input.Features)
		input.ShopItem.Features = string(featuresJSON)
	} else {
		input.ShopItem.Features = "[]"
	}

	if err := database.DB.Create(&input.ShopItem).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

func UpdateShopItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var item models.ShopItem
	if err := database.DB.First(&item, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var input struct {
		models.ShopItem
		Features []string `json:"features"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(input.Features) > 0 {
		featuresJSON, _ := json.Marshal(input.Features)
		input.ShopItem.Features = string(featuresJSON)
	} else {
		input.ShopItem.Features = "[]"
	}

	item = input.ShopItem
	item.ID = uint(id)

	if err := database.DB.Save(&item).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func DeleteShopItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := database.DB.Delete(&models.ShopItem{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
