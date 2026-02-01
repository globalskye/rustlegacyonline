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

// ReceiveStatsSync handles POST from TopSystem plugin - upserts players and clans
// POST /api/stats/sync
func ReceiveStatsSync(w http.ResponseWriter, r *http.Request) {
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

	// Build hexId -> our clan ID map (TopSystem uses 1-based index, we use hexId)
	hexToClanID := make(map[string]uint)

	normalizeHexID := func(s string) string {
		if s == "" {
			return s
		}
		if s[0] != '0' || (len(s) < 2 || s[1] != 'x') {
			return "0x" + s
		}
		return s
	}

	for _, c := range payload.Clans {
		if c.HexID == "" {
			continue
		}
		hexID := normalizeHexID(c.HexID)
		var clan models.Clan
		if err := database.DB.Where("hex_id = ?", hexID).First(&clan).Error; err != nil {
			clan = models.Clan{
				HexID:         hexID,
				Name:          c.Name,
				Abbrev:        c.Abbrev,
				LeaderSteamID: c.LeaderSteamID,
				Created:       time.Now(),
				Level:         c.Level,
				Experience:    c.Experience,
				MemberCount:   c.MemberCount,
			}
			if err := database.DB.Create(&clan).Error; err != nil {
				log.Printf("[StatsSync] clan create error: %v", err)
				continue
			}
		} else {
			clan.Name = c.Name
			clan.Abbrev = c.Abbrev
			clan.LeaderSteamID = c.LeaderSteamID
			clan.Level = c.Level
			clan.Experience = c.Experience
			clan.MemberCount = c.MemberCount
			database.DB.Save(&clan)
		}
		hexToClanID[c.HexID] = clan.ID
		hexToClanID[hexID] = clan.ID

		// Upsert clan members
		database.DB.Where("clan_id = ?", clan.ID).Delete(&models.ClanMember{})
		for _, steamID := range c.MemberIDs {
			if steamID == "" {
				continue
			}
			database.DB.Create(&models.ClanMember{ClanID: clan.ID, SteamID: steamID, Permissions: ""})
		}
	}

	now := time.Now()
	playersImported := 0
	for _, p := range payload.Players {
		if p.SteamID == "" {
			continue
		}
		var clanID *uint
		// Resolve clan from clans[].memberIds containing this steamId
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

		var existing models.Player
		if err := database.DB.Where("steam_id = ?", p.SteamID).First(&existing).Error; err == nil {
			existing.Username = p.Username
			existing.KilledPlayers = p.KilledPlayers
			existing.KilledMutants = p.KilledMutants
			existing.KilledAnimals = p.KilledAnimals
			existing.Deaths = p.Deaths
			existing.PlayTime = p.PlayTime
			existing.IsOnline = p.IsOnline
			existing.ClanID = clanID
			existing.LastConnectDate = now
			database.DB.Save(&existing)
		} else {
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
		}
		playersImported++

		// Upsert PlayerStats
		if p.Stats != nil {
			var stats models.PlayerStats
			if database.DB.Where("steam_id = ?", p.SteamID).First(&stats).Error != nil {
				stats = models.PlayerStats{SteamID: p.SteamID}
			}
			stats.RaidObjects = p.Stats.RaidObjects
			stats.TimeMinutes = p.Stats.TimeMinutes
			stats.Wood = p.Stats.Wood
			stats.Metal = p.Stats.Metal
			stats.Sulfur = p.Stats.Sulfur
			stats.Suicides = p.Stats.Suicides
			database.DB.Save(&stats)
		}
	}

	// Link players to clans by memberIds (clan might have been created without player's clanId in payload)
	for _, c := range payload.Clans {
		if c.HexID == "" {
			continue
		}
		hexID := normalizeHexID(c.HexID)
		clanID, ok := hexToClanID[hexID]
		if !ok {
			continue
		}
		for _, steamID := range c.MemberIDs {
			database.DB.Model(&models.Player{}).Where("steam_id = ?", steamID).Update("clan_id", clanID)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":      true,
		"players": playersImported,
		"clans":   len(payload.Clans),
	})
}
