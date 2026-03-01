package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

// TopSystem sync payload
type statsSyncPayload struct {
	Timestamp   string                 `json:"timestamp"`
	ServerStatus *struct {
		IsOnline       bool `json:"isOnline"`
		CurrentPlayers int  `json:"currentPlayers"`
		MaxPlayers     int  `json:"maxPlayers"`
	} `json:"serverStatus"`
	Players []struct {
		SteamID       string `json:"steamId"`
		Username      string `json:"username"`
		KilledPlayers int    `json:"killedPlayers"`
		KilledMutants int    `json:"killedMutants"`
		KilledAnimals int    `json:"killedAnimals"`
		Deaths        int    `json:"deaths"`
		Balance       int    `json:"balance"`
		PlayTime      int    `json:"playTime"`
		IsOnline      bool   `json:"isOnline"`
		ClanID        *int   `json:"clanId"`
		Stats         *struct {
			RaidObjects int `json:"raidObjects"`
			TimeMinutes int `json:"timeMinutes"`
			Wood        int `json:"wood"`
			Metal       int `json:"metal"`
			Sulfur      int `json:"sulfur"`
			Suicides    int `json:"suicides"`
		} `json:"stats"`
	} `json:"players"`
	Clans []struct {
		ID          int      `json:"id"`
		HexID       string   `json:"hexId"`
		Name        string   `json:"name"`
		Abbrev      string   `json:"abbrev"`
		LeaderSteamID string `json:"leaderSteamId"`
		Level       int      `json:"level"`
		Experience  int      `json:"experience"`
		MemberCount int      `json:"memberCount"`
		MemberIDs   []string `json:"memberIds"`
	} `json:"clans"`
}

// ReceiveStatsSync handles POST from TopSystem plugin - full replace of clans and players.
// Каждая запись полностью удаляется и создаётся заново — без дублей.
// POST /api/stats/sync
// GET /api/stats/sync — проверка доступности эндпоинта
func ReceiveStatsSync(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","message":"POST JSON with players and clans to sync"}`))
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var payload statsSyncPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		log.Printf("[StatsSync] decode error: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	normalizeHexID := func(s string) string {
		if s == "" {
			return s
		}
		if len(s) < 2 || s[0] != '0' || s[1] != 'x' {
			return "0x" + s
		}
		return s
	}

	// 1. Полное удаление: clans, clan_members, players, player_stats
	// Порядок из-за foreign key: stats -> players (unlink clan) -> clan_members -> clans
	database.DB.Exec("DELETE FROM player_stats")
	database.DB.Exec("DELETE FROM players")
	database.DB.Exec("DELETE FROM clan_members")
	database.DB.Exec("DELETE FROM clans")

	// 3. Создаём кланы заново
	hexToClanID := make(map[string]uint)
	now := time.Now()
	for _, c := range payload.Clans {
		if c.HexID == "" {
			continue
		}
		hexID := normalizeHexID(c.HexID)
		clan := models.Clan{
			HexID:         hexID,
			Name:          c.Name,
			Abbrev:        c.Abbrev,
			LeaderSteamID: c.LeaderSteamID,
			Created:       now,
			Level:         c.Level,
			Experience:    c.Experience,
			MemberCount:   c.MemberCount,
		}
		if err := database.DB.Create(&clan).Error; err != nil {
			log.Printf("[StatsSync] clan create error: %v", err)
			continue
		}
		hexToClanID[c.HexID] = clan.ID
		hexToClanID[hexID] = clan.ID

		for _, steamID := range c.MemberIDs {
			if steamID != "" {
				database.DB.Create(&models.ClanMember{ClanID: clan.ID, SteamID: steamID, Permissions: ""})
			}
		}
	}

	// 4. Создаём игроков заново
	playersImported := 0
	for _, p := range payload.Players {
		if p.SteamID == "" {
			continue
		}
		var clanID *uint
		for _, c := range payload.Clans {
			for _, mid := range c.MemberIDs {
				if mid == p.SteamID {
					if id, ok := hexToClanID[c.HexID]; ok {
						clanID = &id
					}
					break
				}
			}
			if clanID != nil {
				break
			}
		}

		database.DB.Create(&models.Player{
			SteamID:          p.SteamID,
			Username:         p.Username,
			KilledPlayers:    p.KilledPlayers,
			KilledMutants:    p.KilledMutants,
			KilledAnimals:    p.KilledAnimals,
			Deaths:           p.Deaths,
			PlayTime:         p.PlayTime,
			IsOnline:         p.IsOnline,
			ClanID:           clanID,
			FirstConnectDate: now,
			LastConnectDate:  now,
		})
		playersImported++

		if p.Stats != nil {
			database.DB.Create(&models.PlayerStats{
				SteamID:     p.SteamID,
				RaidObjects: p.Stats.RaidObjects,
				TimeMinutes: p.Stats.TimeMinutes,
				Wood:        p.Stats.Wood,
				Metal:       p.Stats.Metal,
				Sulfur:      p.Stats.Sulfur,
				Suicides:    p.Stats.Suicides,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":      true,
		"players": playersImported,
		"clans":   len(payload.Clans),
	})
}
