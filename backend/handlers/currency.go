package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
)

type exchangerateResponse struct {
	Base  string             `json:"base"`
	Rates map[string]float64 `json:"rates"`
}

// fallbackRates — если API недоступен (прод, фаервол), отдаём разумные курсы
var fallbackRates = map[string]float64{
	"USD": 1,
	"EUR": 0.92,
	"CZK": 22,
	"RUB": 95,
	"BYN": 3.2,
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

	result := fetchRates()
	if result == nil {
		result = fallbackRates
		log.Printf("[Currency] using fallback rates (API unreachable)")
	}

	ratesMu.Lock()
	ratesCache = result
	ratesCacheTime = time.Now()
	ratesMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func fetchRates() map[string]float64 {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get("https://api.exchangerate-api.com/v4/latest/USD")
	if err != nil {
		log.Printf("[Currency] API fetch failed: %v", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[Currency] API returned %d", resp.StatusCode)
		return nil
	}

	var data exchangerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Printf("[Currency] parse error: %v", err)
		return nil
	}

	result := map[string]float64{
		"USD": 1,
		"CZK": data.Rates["CZK"],
		"RUB": data.Rates["RUB"],
		"BYN": data.Rates["BYN"],
		"EUR": data.Rates["EUR"],
	}
	// подставляем fallback для нулевых/отсутствующих
	for k, v := range fallbackRates {
		if result[k] == 0 {
			result[k] = v
		}
	}
	return result
}
