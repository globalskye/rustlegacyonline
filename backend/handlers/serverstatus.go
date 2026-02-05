package handlers

import (
	"encoding/json"
	"net/http"
	"sort"
	"sync"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/gameserver"
)

// uptimeTracker: first time we see each server online (by server ID)
var (
	uptimeFirstSeen = make(map[uint]time.Time)
	uptimeMu        sync.RWMutex
)

// statusCache: обновляется раз в 10 сек, отдаём готовые данные
var (
	statusCache     = make(map[string][]models.ServerStatus) // "all" | "classic" | "deathmatch"
	statusCacheMu   sync.RWMutex
	statusCacheInit sync.Once
)

// InitServerStatusCache запускает фоновое обновление кэша (вызывать из main)
func InitServerStatusCache() {
	statusCacheInit.Do(func() {
		refreshAllStatusCaches()
		go func() {
			ticker := time.NewTicker(10 * time.Second)
			for range ticker.C {
				refreshAllStatusCaches()
			}
		}()
	})
}

func refreshAllStatusCaches() {
	refreshStatusCache("")
	refreshStatusCache("classic")
	refreshStatusCache("deathmatch")
}

func refreshStatusCache(serverType string) {
	statuses := fetchStatuses(serverType)
	statusCacheMu.Lock()
	key := "all"
	if serverType != "" {
		key = serverType
	}
	statusCache[key] = statuses
	statusCacheMu.Unlock()
}

func fetchStatuses(serverType string) []models.ServerStatus {
	var servers []models.ServerInfo
	query := database.DB
	if serverType != "" {
		query = query.Where("type = ?", serverType)
	}
	if err := query.Order("sort_order ASC, id ASC").Find(&servers).Error; err != nil {
		return nil
	}
	type serverResult struct {
		index  int
		info   gameserver.Info
		server models.ServerInfo
	}
	results := make([]serverResult, len(servers))
	var wg sync.WaitGroup
	for i, server := range servers {
		wg.Add(1)
		go func(idx int, srv models.ServerInfo) {
			defer wg.Done()
			info := gameserver.Query(srv.IP, srv.Port, srv.QueryPort)
			results[idx] = serverResult{index: idx, info: info, server: srv}
		}(i, server)
	}
	wg.Wait()
	sort.Slice(results, func(i, j int) bool { return results[i].index < results[j].index })

	var statuses []models.ServerStatus
	for _, r := range results {
		server := r.server
		info := r.info
		currentPlayers := info.Players
		if reported, ok := getReportedOnline(server.Type); ok {
			currentPlayers = reported
		}

		var players []models.Player
		if reportedPlayers, ok := getReportedOnlinePlayers(server.Type); ok {
			for _, p := range reportedPlayers {
				players = append(players, models.Player{
					SteamID:       p.SteamID,
					Username:      p.Username,
					IsOnline:      true,
				})
			}
		}

		maxPlayers := info.MaxPlayers
		if maxPlayers <= 0 {
			maxPlayers = server.MaxPlayers
		}
		isOnline := info.Status == "Online" || currentPlayers > 0

		// Uptime: time since we first saw this server online (A2S doesn't provide it)
		var uptime int64
		if isOnline {
			uptimeMu.Lock()
			if _, ok := uptimeFirstSeen[server.ID]; !ok {
				uptimeFirstSeen[server.ID] = time.Now()
			}
			uptime = int64(time.Since(uptimeFirstSeen[server.ID]).Seconds())
			uptimeMu.Unlock()
		} else {
			uptimeMu.Lock()
			delete(uptimeFirstSeen, server.ID)
			uptimeMu.Unlock()
		}

		status := models.ServerStatus{
			ServerID:       server.ID,
			ServerName:     server.Name,
			ServerType:     server.Type,
			IsOnline:       isOnline,
			CurrentPlayers: currentPlayers,
			MaxPlayers:     maxPlayers,
			Map:            info.Map,
			Uptime:         uptime,
			IP:             server.IP,
			Port:           server.Port,
			ActivePlayers:  players,
		}
		if info.Map == "" {
			status.Map = "Unknown"
		}
		statuses = append(statuses, status)
	}
	return statuses
}

func GetServerStatusClassic(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, "classic")
}

func GetServerStatusDeathmatch(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, "deathmatch")
}

func GetServerStatus(w http.ResponseWriter, r *http.Request) {
	getServerStatusByType(w, r.URL.Query().Get("type"))
}

func getServerStatusByType(w http.ResponseWriter, serverType string) {
	InitServerStatusCache()
	key := "all"
	if serverType != "" {
		key = serverType
	}
	statusCacheMu.RLock()
	statuses := statusCache[key]
	statusCacheMu.RUnlock()
	if statuses == nil {
		statuses = []models.ServerStatus{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}
