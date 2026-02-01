package handlers

import (
	"net/http"

	"rust-legacy-site/database"
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
