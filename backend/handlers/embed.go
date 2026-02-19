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
// Shows current Classic online + download link. Formatted for clean Discord/VK preview.
func EmbedPreview(w http.ResponseWriter, r *http.Request) {
	online := getClassicOnlineCount()
	downloadURL := getPrimaryDownloadURL()

	// Short description for Discord (truncates ~200 chars)
	descShort := fmt.Sprintf("Онлайн Classic: %d | Скачать: %s", online, downloadURL)
	if online == 0 {
		descShort = fmt.Sprintf("Rust Legacy сервер. Скачать: %s", downloadURL)
	}
	if len(descShort) > 180 {
		descShort = descShort[:177] + "..."
	}

	// Escape for HTML
	descEsc := strings.ReplaceAll(descShort, "&", "&amp;")
	descEsc = strings.ReplaceAll(descEsc, "<", "&lt;")
	descEsc = strings.ReplaceAll(descEsc, ">", "&gt;")
	descEsc = strings.ReplaceAll(descEsc, "\"", "&quot;")

	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#e67e22">
<title>Rust Legacy Online — Онлайн: %d | Скачать</title>
<meta name="description" content="%s">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Rust Legacy">
<meta property="og:title" content="Rust Legacy Online">
<meta property="og:description" content="%s">
<meta property="og:url" content="%s/">
<meta property="og:image" content="%s/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ru_RU">
<meta property="og:locale:alternate" content="en_US">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Rust Legacy Online">
<meta name="twitter:description" content="%s">
<meta name="twitter:image" content="%s/og-image.png">
</head>
<body style="margin:0;padding:2rem;font-family:system-ui,sans-serif;background:#0f0c09;color:#f5f0eb;">
<div style="max-width:600px;">
<h1 style="margin:0 0 0.5rem;font-size:1.8rem;color:#e67e22;">Rust Legacy</h1>
<h2 style="margin:0 0 1rem;font-size:1.2rem;font-weight:500;color:#d4cfc9;">Rust Legacy Online</h2>
<p style="margin:0 0 1rem;color:#a89f96;font-size:1rem;">Онлайн Classic: %d</p>
<p style="margin:0;"><a href="%s" style="color:#e67e22;">Скачать клиент</a></p>
</div>
</body>
</html>`, online, descEsc, descEsc, SiteURL, SiteURL, descEsc, SiteURL, online, downloadURL)

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
