package statssync

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/gameserver"
)

// Payload sent to external endpoint (like raidreport style)
type StatsPayload struct {
	Timestamp   time.Time           `json:"timestamp"`
	Server      ServerInfoPayload   `json:"server"`
	ServerStatus *ServerStatusPayload `json:"serverStatus,omitempty"`
	Players     []PlayerPayload     `json:"players"`
	Clans       []ClanPayload       `json:"clans"`
}

type ServerInfoPayload struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	IP          string `json:"ip"`
	Port        int    `json:"port"`
	MaxPlayers  int    `json:"maxPlayers"`
	GameVersion string `json:"gameVersion"`
}

type ServerStatusPayload struct {
	IsOnline       bool   `json:"isOnline"`
	CurrentPlayers int    `json:"currentPlayers"`
	MaxPlayers     int    `json:"maxPlayers"`
	Map            string `json:"map"`
}

type PlayerPayload struct {
	SteamID          string        `json:"steamId"`
	Username         string        `json:"username"`
	KilledPlayers    int           `json:"killedPlayers"`
	KilledMutants    int           `json:"killedMutants"`
	KilledAnimals    int           `json:"killedAnimals"`
	Deaths           int           `json:"deaths"`
	PlayTime         int           `json:"playTime"`
	FirstConnectDate time.Time     `json:"firstConnectDate"`
	LastConnectDate  time.Time     `json:"lastConnectDate"`
	IsOnline         bool          `json:"isOnline"`
	ClanID           *uint         `json:"clanId,omitempty"`
	Stats            *PlayerStatsPayload `json:"stats,omitempty"`
}

type PlayerStatsPayload struct {
	RaidObjects int `json:"raidObjects"`
	TimeMinutes int `json:"timeMinutes"`
	Wood        int `json:"wood"`
	Metal       int `json:"metal"`
	Sulfur      int `json:"sulfur"`
}

type ClanPayload struct {
	ID           uint     `json:"id"`
	HexID        string   `json:"hexId"`
	Name         string   `json:"name"`
	Abbrev       string   `json:"abbrev"`
	Level        int      `json:"level"`
	Experience   int      `json:"experience"`
	MemberCount  int      `json:"memberCount"`
	MemberIDs    []string `json:"memberIds,omitempty"`
	TotalKills   int      `json:"totalKills"`
	TotalDeaths  int      `json:"totalDeaths"`
	TotalFarm    int      `json:"totalFarm"` // wood+metal+sulfur sum
}

// Run fetches all TopSystem data and POSTs to STATS_SYNC_ENDPOINT
func Run() {
	endpoint := os.Getenv("STATS_SYNC_ENDPOINT")
	if endpoint == "" {
		return
	}

	var servers []models.ServerInfo
	if err := database.DB.Find(&servers).Error; err != nil {
		log.Printf("[StatsSync] db error: %v", err)
		return
	}
	if len(servers) == 0 {
		return
	}
	server := servers[0]

	// Query live server status (HTTP to IP - Rust Legacy TLS 1.0)
	var statusPayload *ServerStatusPayload
	info := gameserver.Query(server.IP, server.Port)
	statusPayload = &ServerStatusPayload{
		IsOnline:       info.Status == "Online",
		CurrentPlayers: info.Players,
		MaxPlayers:     info.MaxPlayers,
		Map:            info.Map,
	}
	if statusPayload.Map == "" {
		statusPayload.Map = "Unknown"
	}

	// Players with clan link and stats
	var players []models.Player
	database.DB.Preload("Clan").Order("killed_players DESC").Find(&players)
	playerPayloads := make([]PlayerPayload, 0, len(players))
	for _, p := range players {
		pp := PlayerPayload{
			SteamID:          p.SteamID,
			Username:         p.Username,
			KilledPlayers:    p.KilledPlayers,
			KilledMutants:    p.KilledMutants,
			KilledAnimals:    p.KilledAnimals,
			Deaths:           p.Deaths,
			PlayTime:         p.PlayTime,
			FirstConnectDate: p.FirstConnectDate,
			LastConnectDate:  p.LastConnectDate,
			IsOnline:         p.IsOnline,
			ClanID:           p.ClanID,
		}
		if p.Stats != nil {
			pp.Stats = &PlayerStatsPayload{
				RaidObjects: p.Stats.RaidObjects,
				TimeMinutes: p.Stats.TimeMinutes,
				Wood:        p.Stats.Wood,
				Metal:       p.Stats.Metal,
				Sulfur:      p.Stats.Sulfur,
			}
		} else {
			var stats models.PlayerStats
			if database.DB.Where("steam_id = ?", p.SteamID).First(&stats).Error == nil {
				pp.Stats = &PlayerStatsPayload{
					RaidObjects: stats.RaidObjects,
					TimeMinutes: stats.TimeMinutes,
					Wood:        stats.Wood,
					Metal:       stats.Metal,
					Sulfur:      stats.Sulfur,
				}
			}
		}
		playerPayloads = append(playerPayloads, pp)
	}

	// Clans with members and aggregated stats
	var clans []models.Clan
	database.DB.Preload("Members").Order("experience DESC").Find(&clans)
	clanPayloads := make([]ClanPayload, 0, len(clans))
	for _, c := range clans {
		memberIDs := make([]string, 0, len(c.Members))
		for _, m := range c.Members {
			memberIDs = append(memberIDs, m.SteamID)
		}
		// Aggregate kills, deaths, farm from members
		var totalKills, totalDeaths, totalFarm int
		for _, m := range c.Members {
			var p models.Player
			if database.DB.Where("steam_id = ?", m.SteamID).First(&p).Error == nil {
				totalKills += p.KilledPlayers
				totalDeaths += p.Deaths
				var s models.PlayerStats
				if database.DB.Where("steam_id = ?", m.SteamID).First(&s).Error == nil {
					totalFarm += s.Wood + s.Metal + s.Sulfur
				}
			}
		}
		clanPayloads = append(clanPayloads, ClanPayload{
			ID:          c.ID,
			HexID:       c.HexID,
			Name:        c.Name,
			Abbrev:      c.Abbrev,
			Level:       c.Level,
			Experience:  c.Experience,
			MemberCount: c.MemberCount,
			MemberIDs:   memberIDs,
			TotalKills:  totalKills,
			TotalDeaths: totalDeaths,
			TotalFarm:   totalFarm,
		})
	}

	payload := StatsPayload{
		Timestamp:     time.Now(),
		Server: ServerInfoPayload{
			ID:          server.ID,
			Name:        server.Name,
			IP:          server.IP,
			Port:        server.Port,
			MaxPlayers:  server.MaxPlayers,
			GameVersion: server.GameVersion,
		},
		ServerStatus: statusPayload,
		Players:      playerPayloads,
		Clans:        clanPayloads,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[StatsSync] marshal error: %v", err)
		return
	}

	// Use HTTP (not HTTPS) for Rust Legacy / TLS 1.0 compatibility when endpoint is IP
	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
	if err != nil {
		log.Printf("[StatsSync] request error: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[StatsSync] POST error: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("[StatsSync] endpoint returned %d", resp.StatusCode)
		return
	}
	log.Printf("[StatsSync] synced %d players, %d clans to %s", len(playerPayloads), len(clanPayloads), endpoint)
}
