package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
)

func init() {
	if u := os.Getenv("SITE_URL"); u != "" {
		SiteURL = strings.TrimSuffix(u, "/")
	}
}

// SiteURL is the canonical site URL for OG tags (override via SITE_URL env)
var SiteURL = "https://rustlegacy.online"

// EmbedPreview returns HTML with dynamic Open Graph meta for Discord, VK, etc.
// Shows current Classic online + download link.
func EmbedPreview(w http.ResponseWriter, r *http.Request) {
	online := getClassicOnlineCount()
	downloadURL := getPrimaryDownloadURL()

	desc := fmt.Sprintf("Онлайн Classic: %d | Скачать: %s", online, downloadURL)
	if online == 0 {
		desc = fmt.Sprintf("Rust Legacy сервер. Скачать: %s", downloadURL)
	}

	// Escape for HTML
	desc = strings.ReplaceAll(desc, "&", "&amp;")
	desc = strings.ReplaceAll(desc, "<", "&lt;")
	desc = strings.ReplaceAll(desc, ">", "&gt;")
	desc = strings.ReplaceAll(desc, "\"", "&quot;")

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta property="og:title" content="Rust Legacy Online">
<meta property="og:description" content="%s">
<meta property="og:type" content="website">
<meta property="og:url" content="%s/">
<meta property="og:image" content="%s/og-image.png">
<meta property="og:site_name" content="Rust Legacy">
<meta property="og:locale" content="ru_RU">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Rust Legacy Online">
<meta name="twitter:description" content="%s">
<meta name="description" content="%s">
<title>Rust Legacy Online — Онлайн: %d | Скачать</title>
</head>
<body>
<p>Rust Legacy Online</p>
<p>Онлайн Classic: %d</p>
<p><a href="%s">Скачать игру</a></p>
</body>
</html>`, desc, SiteURL, SiteURL, desc, desc, online, online, downloadURL)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}

func getClassicOnlineCount() int {
	InitServerStatusCache()
	statusCacheMu.RLock()
	statuses := statusCache["classic"]
	statusCacheMu.RUnlock()

	total := 0
	for _, s := range statuses {
		total += s.CurrentPlayers
	}
	return total
}

func getPrimaryDownloadURL() string {
	var link models.DownloadLink
	if err := database.DB.Order("\"order\" ASC").First(&link).Error; err == nil && link.URL != "" {
		return link.URL
	}
	var srv models.ServerInfo
	if err := database.DB.First(&srv).Error; err == nil && srv.DownloadURL != "" {
		return srv.DownloadURL
	}
	return SiteURL + "/how-to-start"
}
