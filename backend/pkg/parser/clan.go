package parser

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"rust-legacy-site/models"
)

// ClanScanner iterates over clan blocks in file content
type ClanScanner struct {
	lines []string
	pos   int
}

func NewClanScanner(content string) *ClanScanner {
	var lines []string
	for _, line := range strings.Split(content, "\n") {
		lines = append(lines, line)
	}
	return &ClanScanner{lines: lines}
}

func (s *ClanScanner) Next() (*models.Clan, []models.ClanMember) {
	for s.pos < len(s.lines) {
		line := s.lines[s.pos]
		if strings.HasPrefix(strings.TrimSpace(line), "[0x") {
			clan, members := s.parseBlock()
			if clan != nil {
				return clan, members
			}
		}
		s.pos++
	}
	return nil, nil
}

func (s *ClanScanner) parseBlock() (*models.Clan, []models.ClanMember) {
	var hexID, name, abbrev, leaderSteamID, createdStr, flags, motd string
	var balance, tax, level, experience int
	var members []models.ClanMember

	keyValue := regexp.MustCompile(`^([A-Z]+)=(.*)$`)
	hexBlock := regexp.MustCompile(`^\[(0x[0-9A-Fa-f]+)\]$`)

	for s.pos < len(s.lines) {
		line := s.lines[s.pos]
		trimmed := strings.TrimSpace(line)

		if trimmed == "" {
			s.pos++
			continue
		}

		if m := hexBlock.FindStringSubmatch(trimmed); m != nil {
			if hexID != "" {
				break
			}
			hexID = m[1]
			s.pos++
			continue
		}

		if m := keyValue.FindStringSubmatch(trimmed); m != nil {
			key, val := m[1], m[2]
			switch key {
			case "NAME":
				name = val
			case "ABBREV":
				abbrev = val
			case "LEADER":
				leaderSteamID = val
			case "CREATED":
				createdStr = val
			case "FLAGS":
				flags = val
			case "BALANCE":
				balance, _ = strconv.Atoi(val)
			case "TAX":
				tax, _ = strconv.Atoi(val)
			case "LEVEL":
				level, _ = strconv.Atoi(val)
			case "EXPERIENCE":
				experience, _ = strconv.Atoi(val)
			case "MOTD":
				motd = val
			case "MEMBER":
				parts := strings.SplitN(val, ",", 2)
				if len(parts) >= 1 {
					perms := "0"
					if len(parts) >= 2 {
						perms = parts[1]
					}
					members = append(members, models.ClanMember{
						SteamID:     strings.TrimSpace(parts[0]),
						Permissions: perms,
					})
				}
			}
		}
		s.pos++
	}

	if hexID == "" || name == "" {
		return nil, nil
	}

	created := time.Now()
	if t, err := time.Parse("01/02/2006 15:04:05", createdStr); err == nil {
		created = t
	}

	clan := &models.Clan{
		HexID:         hexID,
		Name:          name,
		Abbrev:        abbrev,
		LeaderSteamID: leaderSteamID,
		Created:       created,
		Level:         level,
		Experience:    experience,
		Tax:           tax,
		Balance:       balance,
		MOTD:          motd,
		Flags:         flags,
		MemberCount:   len(members),
	}
	return clan, members
}

