package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"rust-legacy-site/database"
	authpkg "rust-legacy-site/pkg/auth"

	"gorm.io/gorm"
)

func AuthMe(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}
	// Support Bearer token
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		claims, err := authpkg.ValidateToken(authHeader[7:])
		if err != nil {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"username": claims.Username,
			"adminId":  claims.AdminID,
		})
		return
	}
	http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	if req.Username == "" || req.Password == "" {
		http.Error(w, `{"error":"username and password required"}`, http.StatusBadRequest)
		return
	}

	token, err := authpkg.Login(database.DB, req.Username, req.Password)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
			return
		}
		log.Printf("[Auth] Login error: %v", err)
		http.Error(w, `{"error":"login failed"}`, http.StatusInternalServerError)
		return
	}
	if token == "" {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token":   token,
		"message": "Login successful",
	})
}
