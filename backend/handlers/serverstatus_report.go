package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// Reported online per server type (from TopSystem/plugin)
var (
	reportedOnline     = make(map[string]onlineReport)
	reportedOnlineMu   sync.RWMutex
	reportValidSeconds = 120
)

type onlinePlayer struct {
	SteamID  string `json:"steamId"`
	Username string `json:"username"`
}

type onlineReport struct {
	CurrentPlayers int            `json:"currentPlayers"`
	SteamIDs       []string       `json:"steamIds,omitempty"`
	Players        []onlinePlayer `json:"players,omitempty"`
	ReportedAt     time.Time
}

type reportPayload struct {
	Classic    *onlineReport `json:"classic"`
	Deathmatch *onlineReport `json:"deathmatch"`
	// Or by server ID
	ServerID   *uint         `json:"serverId"`
}

// ReportServerOnline accepts current online from game plugin (TopSystem).
// POST body: { "classic": { "currentPlayers": 5 }, "deathmatch": { "currentPlayers": 2 } }
func ReportServerOnline(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var p reportPayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	reportedOnlineMu.Lock()
	defer reportedOnlineMu.Unlock()
	now := time.Now()
	if p.Classic != nil {
		p.Classic.ReportedAt = now
		reportedOnline["classic"] = *p.Classic
	}
	if p.Deathmatch != nil {
		p.Deathmatch.ReportedAt = now
		reportedOnline["deathmatch"] = *p.Deathmatch
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"ok": "true"})
}

func getReportedOnline(serverType string) (players int, valid bool) {
	reportedOnlineMu.RLock()
	r, ok := reportedOnline[serverType]
	reportedOnlineMu.RUnlock()
	if !ok {
		return 0, false
	}
	if time.Since(r.ReportedAt).Seconds() > float64(reportValidSeconds) {
		return 0, false
	}
	return r.CurrentPlayers, true
}

func getReportedOnlinePlayers(serverType string) ([]onlinePlayer, bool) {
	reportedOnlineMu.RLock()
	r, ok := reportedOnline[serverType]
	reportedOnlineMu.RUnlock()
	if !ok {
		return nil, false
	}
	if time.Since(r.ReportedAt).Seconds() > float64(reportValidSeconds) {
		return nil, false
	}
	return r.Players, len(r.Players) > 0
}
