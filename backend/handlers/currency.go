package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

type exchangerateResponse struct {
	Base  string             `json:"base"`
	Rates map[string]float64 `json:"rates"`
}

var (
	ratesCache     map[string]float64
	ratesCacheTime time.Time
	ratesMu        sync.RWMutex
)

// GetCurrencyRates returns USD rates for CZK, RUB, BYN, EUR
func GetCurrencyRates(w http.ResponseWriter, r *http.Request) {
	ratesMu.RLock()
	if time.Since(ratesCacheTime) < 1*time.Hour && ratesCache != nil {
		defer ratesMu.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ratesCache)
		return
	}
	ratesMu.RUnlock()

	// Fetch from free API (no key required)
	resp, err := http.Get("https://api.exchangerate-api.com/v4/latest/USD")
	if err != nil {
		http.Error(w, "failed to fetch rates: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	var data exchangerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		http.Error(w, "failed to parse rates", http.StatusBadGateway)
		return
	}

	result := map[string]float64{
		"USD": 1,
		"CZK": data.Rates["CZK"],
		"RUB": data.Rates["RUB"],
		"BYN": data.Rates["BYN"],
		"EUR": data.Rates["EUR"],
	}
	if result["CZK"] == 0 {
		result["CZK"] = 22
	}
	if result["RUB"] == 0 {
		result["RUB"] = 90
	}
	if result["BYN"] == 0 {
		result["BYN"] = 3.2
	}
	if result["EUR"] == 0 {
		result["EUR"] = 0.92
	}

	ratesMu.Lock()
	ratesCache = result
	ratesCacheTime = time.Now()
	ratesMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
