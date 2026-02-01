package parser

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"rust-legacy-site/models"
)

// PlayerScanner iterates over player blocks in file content
type PlayerScanner struct {
	lines []string
	pos   int
}

func NewPlayerScanner(content string) *PlayerScanner {
	var lines []string
	for _, line := range strings.Split(content, "\n") {
		lines = append(lines, line)
	}
	return &PlayerScanner{lines: lines}
}

func (s *PlayerScanner) Next() *models.Player {
	for s.pos < len(s.lines) {
		line := s.lines[s.pos]
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "[") && strings.HasSuffix(trimmed, "]") {
			steamMatch := regexp.MustCompile(`^\[(\d+)\]$`).FindStringSubmatch(trimmed)
			if len(steamMatch) >= 2 {
				player := s.parseBlock(steamMatch[1])
				if player != nil {
					return player
				}
			}
		}
		s.pos++
	}
	return nil
}

func (s *PlayerScanner) parseBlock(steamID string) *models.Player {
	var username, language, firstConnectStr, lastConnectStr string
	var rank, killedPlayers, killedMutants, killedAnimals, deaths, violations int

	keyValue := regexp.MustCompile(`^([A-Z]+)=(.*)$`)

	for s.pos < len(s.lines) {
		line := s.lines[s.pos]
		trimmed := strings.TrimSpace(line)

		if trimmed == "" {
			s.pos++
			continue
		}

		if strings.HasPrefix(trimmed, "[") && !strings.HasPrefix(trimmed, "[0x") {
			if username != "" || rank > 0 {
				break
			}
		}

		if m := keyValue.FindStringSubmatch(trimmed); m != nil {
			key, val := m[1], m[2]
			switch key {
			case "USERNAME":
				username = val
			case "RANK":
				rank, _ = strconv.Atoi(val)
			case "LANGUAGE":
				language = val
			case "KILLEDPLAYERS":
				killedPlayers, _ = strconv.Atoi(val)
			case "KILLEDMUTANTS":
				killedMutants, _ = strconv.Atoi(val)
			case "KILLEDANIMALS":
				killedAnimals, _ = strconv.Atoi(val)
			case "DEATHS":
				deaths, _ = strconv.Atoi(val)
			case "VIOLATIONS":
				violations, _ = strconv.Atoi(val)
			case "FIRSTCONNECTDATE":
				firstConnectStr = val
			case "LASTCONNECTDATE":
				lastConnectStr = val
			}
		}
		s.pos++
	}

	if steamID == "" {
		return nil
	}

	parseDate := func(s string) time.Time {
		if t, err := time.Parse("01/02/2006 15:04:05", s); err == nil {
			return t
		}
		if t, err := time.Parse("02/01/2006 15:04:05", s); err == nil {
			return t
		}
		return time.Now()
	}

	return &models.Player{
		SteamID:          steamID,
		Username:         username,
		Rank:             rank,
		Language:         language,
		KilledPlayers:    killedPlayers,
		KilledMutants:    killedMutants,
		KilledAnimals:    killedAnimals,
		Deaths:           deaths,
		Violations:       violations,
		FirstConnectDate: parseDate(firstConnectStr),
		LastConnectDate:  parseDate(lastConnectStr),
	}
}

