package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

// ClearClansAndPlayers deletes all clans, clan members, players, and player stats.
// Admin only - use to remove test data before TopSystem syncs real data.
// DELETE /api/admin/clear-clans-players
func ClearClansAndPlayers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Delete in order due to foreign keys
	database.DB.Exec("DELETE FROM player_stats")
	database.DB.Exec("DELETE FROM players")
	database.DB.Exec("DELETE FROM clan_members")
	database.DB.Exec("DELETE FROM clans")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ok":true,"message":"Clans and players cleared"}`))
}

// DeleteClanByNameRequest - body for delete by clan name
type DeleteClanByNameRequest struct {
	Name string `json:"name"`
}

// DeleteClanByName deletes clan, its members, and unlinks players by clan name.
// Admin only. Clan name is the key - case-insensitive match.
// DELETE /api/admin/clans/by-name?name=ClanName
// or POST /api/admin/clans/delete-by-name with body {"name":"ClanName"}
func DeleteClanByName(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	name := strings.TrimSpace(r.URL.Query().Get("name"))
	if name == "" {
		if r.Method == http.MethodPost || r.Method == http.MethodDelete {
			var req DeleteClanByNameRequest
			if err := json.NewDecoder(r.Body).Decode(&req); err == nil {
				name = strings.TrimSpace(req.Name)
			}
		}
	}
	if name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "clan name required"})
		return
	}

	var clan models.Clan
	if err := database.DB.Where("LOWER(name) = LOWER(?)", name).First(&clan).Error; err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "clan not found"})
		return
	}

	id := clan.ID
	database.DB.Where("clan_id = ?", id).Delete(&models.ClanMember{})
	database.DB.Model(&models.Player{}).Where("clan_id = ?", id).Update("clan_id", nil)
	database.DB.Delete(&models.Clan{}, id)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "message": "clan deleted"})
}
