package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

// SocialChannel - Discord channel or VK target
type SocialChannel struct {
	ID      string `json:"id"`      // Discord channel ID or VK peer/wall id
	Name    string `json:"name"`    // display name
	Purpose string `json:"purpose"` // e.g. "announcements", "logs"
}

// AutoMessageRule - when to send and where
type AutoMessageRule struct {
	EventType        string `json:"eventType"`        // wipe, server_online, announcement, custom
	DiscordChannelID string `json:"discordChannelId"` // optional
	VKPeerID         string `json:"vkPeerId"`         // optional (e.g. -groupId for wall)
	Template         string `json:"template"`         // message template, e.g. "Wipe at {{.Time}}"
	Enabled          bool   `json:"enabled"`
}

// SocialConfig - full config for admin panel
type SocialConfig struct {
	Discord struct {
		BotToken string          `json:"botToken"`
		Channels []SocialChannel `json:"channels"`
	} `json:"discord"`
	VK struct {
		AccessToken string          `json:"accessToken"`
		GroupID     string          `json:"groupId"`
		Targets     []SocialChannel `json:"targets"` // walls, chats (peer ids)
	} `json:"vk"`
	AutoMessages []AutoMessageRule `json:"autoMessages"`
}

const socialConfigKey = "social_config"

// GetSocialConfig returns current Discord/VK config (admin only). Tokens are masked in response.
func GetSocialConfig(w http.ResponseWriter, r *http.Request) {
	var setting models.Setting
	if err := database.DB.Where("key = ?", socialConfigKey).First(&setting).Error; err != nil {
		// no config yet - return empty
		cfg := SocialConfig{}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cfg)
		return
	}
	var cfg SocialConfig
	if err := json.Unmarshal([]byte(setting.Value), &cfg); err != nil {
		http.Error(w, "Invalid config", http.StatusInternalServerError)
		return
	}
	// Mask tokens for GET (show only last 4 chars)
	maskToken := func(s string) string {
		if len(s) <= 4 {
			return "****"
		}
		return "****" + s[len(s)-4:]
	}
	cfg.Discord.BotToken = maskToken(cfg.Discord.BotToken)
	cfg.VK.AccessToken = maskToken(cfg.VK.AccessToken)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cfg)
}

// UpdateSocialConfig saves Discord/VK config (admin only). Accepts full JSON body.
func UpdateSocialConfig(w http.ResponseWriter, r *http.Request) {
	var cfg SocialConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	// If client sent masked token (****xxxx), keep existing token
	var existing models.Setting
	if database.DB.Where("key = ?", socialConfigKey).First(&existing).Error == nil {
		var existingCfg SocialConfig
		if json.Unmarshal([]byte(existing.Value), &existingCfg) == nil {
			if len(cfg.Discord.BotToken) >= 4 && cfg.Discord.BotToken[:4] == "****" {
				cfg.Discord.BotToken = existingCfg.Discord.BotToken
			}
			if len(cfg.VK.AccessToken) >= 4 && cfg.VK.AccessToken[:4] == "****" {
				cfg.VK.AccessToken = existingCfg.VK.AccessToken
			}
		}
	}

	raw, err := json.Marshal(cfg)
	if err != nil {
		http.Error(w, "Marshal error", http.StatusInternalServerError)
		return
	}
	var s models.Setting
	if database.DB.Where("key = ?", socialConfigKey).First(&s).Error != nil {
		s = models.Setting{Key: socialConfigKey, Value: string(raw)}
		if database.DB.Create(&s).Error != nil {
			http.Error(w, "Failed to save", http.StatusInternalServerError)
			return
		}
	} else {
		s.Value = string(raw)
		if database.DB.Save(&s).Error != nil {
			http.Error(w, "Failed to save", http.StatusInternalServerError)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"ok": "saved"})
}
