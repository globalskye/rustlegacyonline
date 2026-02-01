package parser

import (
	"encoding/json"
	"rust-legacy-site/models"
)

// StatsJSON format: { "76561197961407422": { "RaidObjects": 0, "TimeMinutes": 981, ... } }
type StatsJSON map[string]struct {
	RaidObjects int     `json:"RaidObjects"`
	TimeMinutes float64 `json:"TimeMinutes"`
	Wood        int     `json:"Wood"`
	Metal       int     `json:"Metal"`
	Sulfur      int     `json:"Sulfur"`
	Leather     int     `json:"Leather"`
	Cloth       int     `json:"Cloth"`
	Fat         int     `json:"Fat"`
	Suicides    int     `json:"Suicides"`
}

// ParsePlayerStatsJSON parses the extended stats JSON format
func ParsePlayerStatsJSON(data []byte) ([]models.PlayerStats, error) {
	var raw StatsJSON
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	var result []models.PlayerStats
	for steamID, s := range raw {
		result = append(result, models.PlayerStats{
			SteamID:     steamID,
			RaidObjects: s.RaidObjects,
			TimeMinutes: int(s.TimeMinutes),
			Wood:        s.Wood,
			Metal:       s.Metal,
			Sulfur:      s.Sulfur,
			Leather:     s.Leather,
			Cloth:       s.Cloth,
			Fat:         s.Fat,
			Suicides:    s.Suicides,
		})
	}
	return result, nil
}
