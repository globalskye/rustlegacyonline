package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/parser"
)

// ImportClans parses clan file content and upserts clans + members
// POST /api/import/clans - body: raw clan file text
func ImportClans(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	scanner := parser.NewClanScanner(string(body))
	var imported int

	for {
		clan, members := scanner.Next()
		if clan == nil {
			break
		}

		var existing models.Clan
		if err := database.DB.Where("hex_id = ?", clan.HexID).First(&existing).Error; err == nil {
			existing.Name = clan.Name
			existing.Abbrev = clan.Abbrev
			existing.LeaderSteamID = clan.LeaderSteamID
			existing.Created = clan.Created
			existing.Level = clan.Level
			existing.Experience = clan.Experience
			existing.Tax = clan.Tax
			existing.Balance = clan.Balance
			existing.MOTD = clan.MOTD
			existing.Flags = clan.Flags
			existing.MemberCount = len(members)
			database.DB.Save(&existing)

			database.DB.Where("clan_id = ?", existing.ID).Delete(&models.ClanMember{})
			for _, m := range members {
				m.ClanID = existing.ID
				database.DB.Create(&m)
			}
		} else {
			if err := database.DB.Create(clan).Error; err != nil {
				continue
			}
			for _, m := range members {
				m.ClanID = clan.ID
				database.DB.Create(&m)
			}
		}
		imported++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"imported": imported})
}

// ImportPlayers parses player file content and upserts players
// POST /api/import/players - body: raw player file text
func ImportPlayers(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	scanner := parser.NewPlayerScanner(string(body))
	var imported int

	for {
		player := scanner.Next()
		if player == nil {
			break
		}

		var existing models.Player
		if err := database.DB.Where("steam_id = ?", player.SteamID).First(&existing).Error; err == nil {
			existing.Username = player.Username
			existing.Rank = player.Rank
			existing.Language = player.Language
			existing.KilledPlayers = player.KilledPlayers
			existing.KilledMutants = player.KilledMutants
			existing.KilledAnimals = player.KilledAnimals
			existing.Deaths = player.Deaths
			existing.Violations = player.Violations
			existing.FirstConnectDate = player.FirstConnectDate
			existing.LastConnectDate = player.LastConnectDate
			database.DB.Save(&existing)
		} else {
			database.DB.Create(player)
		}
		imported++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"imported": imported})
}

// ImportStats parses extended stats JSON and upserts PlayerStats
// POST /api/import/stats - body: { "76561197961407422": { "RaidObjects": 0, ... }, ... }
func ImportStats(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stats, err := parser.ParsePlayerStatsJSON(body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, s := range stats {
		database.DB.Save(&s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"imported": len(stats)})
}
