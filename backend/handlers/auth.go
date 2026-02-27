package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	authpkg "rust-legacy-site/pkg/auth"
)

func AuthMe(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}
	if len(authHeader) <= 7 || authHeader[:7] != "Bearer " {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}
	claims, err := authpkg.ValidateToken(authHeader[7:])
	if err != nil {
		http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
		return
	}
	// Backward compat: old tokens may not have Role
	role := claims.Role
	if role == "" && claims.AdminID > 0 {
		role = "admin"
	}
	if role == "" && claims.UserID > 0 {
		role = "user"
	}

	w.Header().Set("Content-Type", "application/json")
	resp := map[string]interface{}{
		"username": claims.Username,
		"role":     role,
	}
	if role == "admin" {
		resp["adminId"] = claims.AdminID
	}
	if role == "user" {
		resp["userId"] = claims.UserID
		resp["login"] = claims.Username
		var u models.User
		if database.DB.First(&u, claims.UserID).Error == nil {
			resp["balance"] = u.Balance
			resp["steamId"] = u.SteamID
		}
	}
	json.NewEncoder(w).Encode(resp)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	login := req.Login
	if login == "" {
		login = req.Username
	}
	if login == "" || req.Password == "" {
		http.Error(w, `{"error":"login and password required"}`, http.StatusBadRequest)
		return
	}

	token, role, err := authpkg.Login(database.DB, login, req.Password)
	if err != nil {
		log.Printf("[Auth] Login error: %v", err)
		http.Error(w, `{"error":"login failed"}`, http.StatusInternalServerError)
		return
	}
	if token == "" {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   token,
		"role":    role,
		"message": "Login successful",
	})
}

func Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	req.Login = strings.TrimSpace(req.Login)
	if len(req.Login) < 3 {
		http.Error(w, `{"error":"login must be at least 3 characters"}`, http.StatusBadRequest)
		return
	}
	if len(req.Password) < 6 {
		http.Error(w, `{"error":"password must be at least 6 characters"}`, http.StatusBadRequest)
		return
	}

	var existing models.User
	if database.DB.Where("login = ?", req.Login).First(&existing).Error == nil {
		http.Error(w, `{"error":"login already taken"}`, http.StatusConflict)
		return
	}

	hash, err := authpkg.HashPassword(req.Password)
	if err != nil {
		http.Error(w, `{"error":"registration failed"}`, http.StatusInternalServerError)
		return
	}

	u := models.User{
		Login:        req.Login,
		PasswordHash: hash,
		Balance:      0,
	}
	if err := database.DB.Create(&u).Error; err != nil {
		http.Error(w, `{"error":"registration failed"}`, http.StatusInternalServerError)
		return
	}

	token, _ := authpkg.GenerateUserToken(u.Login, u.ID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   token,
		"role":    "user",
		"message": "Registration successful",
	})
}
