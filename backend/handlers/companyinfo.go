package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func GetCompanyInfo(w http.ResponseWriter, r *http.Request) {
	var info models.CompanyInfo
	if err := database.DB.First(&info).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.CompanyInfo{})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func UpdateCompanyInfo(w http.ResponseWriter, r *http.Request) {
	var input models.CompanyInfo
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var info models.CompanyInfo
	database.DB.First(&info)
	info.LegalName = input.LegalName
	info.Address = input.Address
	info.Phone = input.Phone
	info.INN = input.INN
	info.OGRN = input.OGRN
	info.BankRequisites = input.BankRequisites
	info.DeliveryInfo = input.DeliveryInfo
	if info.ID == 0 {
		database.DB.Create(&info)
	} else {
		database.DB.Save(&info)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}
