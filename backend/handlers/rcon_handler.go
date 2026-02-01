package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"

	"rust-legacy-site/pkg/rcon"
)

type rconExecuteRequest struct {
	Command string `json:"command"`
	SteamID string `json:"steamId,omitempty"`
}

func ExecuteRcon(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req rconExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.Command == "" {
		http.Error(w, "command required", http.StatusBadRequest)
		return
	}

	host := os.Getenv("RCON_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := 28016
	if p := os.Getenv("RCON_PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	password := os.Getenv("RCON_PASSWORD")
	if password == "" {
		http.Error(w, "rcon not configured", http.StatusServiceUnavailable)
		return
	}

	var resp string
	var err error
	if req.SteamID != "" {
		resp, err = rcon.Execute(host, port, password, req.Command, req.SteamID)
	} else {
		resp, err = rcon.Execute(host, port, password, req.Command, "")
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": resp})
}
