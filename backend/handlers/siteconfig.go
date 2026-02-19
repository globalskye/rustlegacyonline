package handlers

import (
	"encoding/json"
	"net/http"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

// WipeSchedule - weekday (0=Sun..6=Sat), hour/min in UTC
type WipeSchedule struct {
	Weekday int `json:"weekday"` // 0=Sunday, 5=Friday
	Hour    int `json:"hour"`   // UTC
	Minute  int `json:"minute"`
}

// SiteConfig - public site config (social links + wipe schedule)
type SiteConfig struct {
	VKUrl        string       `json:"vkUrl"`
	DiscordUrl   string       `json:"discordUrl"`
	TelegramUrl  string       `json:"telegramUrl"`
	FullWipe     WipeSchedule `json:"fullWipe"`
	PartialWipe  WipeSchedule `json:"partialWipe"`
}

const siteConfigKey = "site_config"

var defaultSiteConfig = SiteConfig{
	VKUrl:       "https://vk.com/samoletov1",
	DiscordUrl:  "https://discordapp.com/users/1322276844237488208",
	TelegramUrl: "https://t.me/globa0029",
	FullWipe:    WipeSchedule{Weekday: 5, Hour: 16, Minute: 0}, // Friday 19:00 MSK (UTC+3)
	PartialWipe: WipeSchedule{Weekday: 2, Hour: 16, Minute: 0}, // Tuesday 19:00 MSK (UTC+3)
}

// GetSiteConfig returns site config (public). Used for floating social links and wipe countdown.
func GetSiteConfig(w http.ResponseWriter, r *http.Request) {
	var setting models.Setting
	if err := database.DB.Where("key = ?", siteConfigKey).First(&setting).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultSiteConfig)
		return
	}
	var cfg SiteConfig
	if err := json.Unmarshal([]byte(setting.Value), &cfg); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultSiteConfig)
		return
	}
	// Merge with defaults for missing fields
	if cfg.VKUrl == "" {
		cfg.VKUrl = defaultSiteConfig.VKUrl
	}
	if cfg.DiscordUrl == "" {
		cfg.DiscordUrl = defaultSiteConfig.DiscordUrl
	}
	if cfg.TelegramUrl == "" {
		cfg.TelegramUrl = defaultSiteConfig.TelegramUrl
	}
	if cfg.FullWipe.Weekday == 0 && cfg.FullWipe.Hour == 0 && cfg.FullWipe.Minute == 0 {
		cfg.FullWipe = defaultSiteConfig.FullWipe
	}
	if cfg.PartialWipe.Weekday == 0 && cfg.PartialWipe.Hour == 0 && cfg.PartialWipe.Minute == 0 {
		cfg.PartialWipe = defaultSiteConfig.PartialWipe
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cfg)
}

// UpdateSiteConfig saves site config (admin only).
func UpdateSiteConfig(w http.ResponseWriter, r *http.Request) {
	var cfg SiteConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	raw, err := json.Marshal(cfg)
	if err != nil {
		http.Error(w, "Marshal error", http.StatusInternalServerError)
		return
	}
	var s models.Setting
	if database.DB.Where("key = ?", siteConfigKey).First(&s).Error != nil {
		s = models.Setting{Key: siteConfigKey, Value: string(raw)}
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
