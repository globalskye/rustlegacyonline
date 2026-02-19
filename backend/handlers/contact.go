package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/email"
)

// ContactRequest is the contact form payload
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

// ContactResponse is the API response
type ContactResponse struct {
	OK    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

// lastContactTime for simple rate limit (per IP, in-memory)
var lastContactByIP = make(map[string]time.Time)
var contactCooldown = 2 * time.Minute

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	return strings.Split(r.RemoteAddr, ":")[0]
}

// SendContact handles POST /api/contact
func SendContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ip := getClientIP(r)
	if last, ok := lastContactByIP[ip]; ok && time.Since(last) < contactCooldown {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Подождите перед повторной отправкой"})
		return
	}

	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Неверный формат"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Email == "" || req.Message == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Заполните все поля"})
		return
	}

	if len(req.Message) > 5000 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Сообщение слишком длинное"})
		return
	}

	// Basic email validation
	if !strings.Contains(req.Email, "@") || len(req.Email) < 5 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Некорректный email"})
		return
	}

	cfg := email.LoadFromEnv()
	if !cfg.Enabled {
		log.Printf("[Contact] Email not configured, skipping send from %s", req.Email)
		lastContactByIP[ip] = time.Now()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ContactResponse{OK: true})
		return
	}

	var companyEmail string
	var info models.CompanyInfo
	if err := database.DB.First(&info).Error; err == nil && info.Email != "" {
		companyEmail = info.Email
	}
	to := email.GetRecipient(companyEmail)
	if to == "" {
		to = cfg.From // fallback to sender
	}

	if err := email.SendContactForm(cfg, to, req.Name, req.Email, req.Message); err != nil {
		log.Printf("[Contact] Send failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ContactResponse{OK: false, Error: "Ошибка отправки. Попробуйте позже."})
		return
	}

	lastContactByIP[ip] = time.Now()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ContactResponse{OK: true})
}
