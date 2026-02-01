package routes

import (
	"rust-legacy-site/handlers"

	"github.com/gorilla/mux"
)

// Setup configures all API routes
func Setup(r *mux.Router) {
	api := r.PathPrefix("/api").Subrouter()

	// Health
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Auth (public)
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST")
	api.HandleFunc("/auth/me", handlers.AuthMe).Methods("GET")

	// Server Info
	api.HandleFunc("/server-info", handlers.GetServerInfo).Methods("GET")
	api.HandleFunc("/server-info", handlers.UpdateServerInfo).Methods("PUT")
	api.HandleFunc("/servers", handlers.GetAllServers).Methods("GET")

	// Server Status (live query). ?type=classic or ?type=deathmatch for specific server
	api.HandleFunc("/server-status", handlers.GetServerStatus).Methods("GET")
	api.HandleFunc("/server-status/classic", handlers.GetServerStatusClassic).Methods("GET")
	api.HandleFunc("/server-status/deathmatch", handlers.GetServerStatusDeathmatch).Methods("GET")
	api.HandleFunc("/server-status/report", handlers.ReportServerOnline).Methods("POST")

	// Features
	api.HandleFunc("/features", handlers.GetFeatures).Methods("GET")
	api.HandleFunc("/features", handlers.CreateFeature).Methods("POST")
	api.HandleFunc("/features/{id}", handlers.UpdateFeature).Methods("PUT")
	api.HandleFunc("/features/{id}", handlers.DeleteFeature).Methods("DELETE")

	// News
	api.HandleFunc("/news", handlers.GetNews).Methods("GET")
	api.HandleFunc("/news", handlers.CreateNews).Methods("POST")
	api.HandleFunc("/news/{id}", handlers.GetNewsItem).Methods("GET")
	api.HandleFunc("/news/{id}", handlers.UpdateNews).Methods("PUT")
	api.HandleFunc("/news/{id}", handlers.DeleteNews).Methods("DELETE")

	// How to Start
	api.HandleFunc("/how-to-start", handlers.GetHowToStartSteps).Methods("GET")
	api.HandleFunc("/how-to-start", handlers.CreateHowToStartStep).Methods("POST")
	api.HandleFunc("/how-to-start/{id}", handlers.UpdateHowToStartStep).Methods("PUT")
	api.HandleFunc("/how-to-start/{id}", handlers.DeleteHowToStartStep).Methods("DELETE")

	// Server Details
	api.HandleFunc("/server-details", handlers.GetServerDetails).Methods("GET")
	api.HandleFunc("/server-details", handlers.CreateServerDetail).Methods("POST")
	api.HandleFunc("/server-details/{id}", handlers.UpdateServerDetail).Methods("PUT")
	api.HandleFunc("/server-details/{id}", handlers.DeleteServerDetail).Methods("DELETE")

	// Plugins
	api.HandleFunc("/plugins", handlers.GetPlugins).Methods("GET")
	api.HandleFunc("/plugins", handlers.CreatePlugin).Methods("POST")
	api.HandleFunc("/plugins/{id}", handlers.UpdatePlugin).Methods("PUT")
	api.HandleFunc("/plugins/{id}", handlers.DeletePlugin).Methods("DELETE")

	// Commands
	api.HandleFunc("/commands", handlers.CreateCommand).Methods("POST")
	api.HandleFunc("/commands/{id}", handlers.UpdateCommand).Methods("PUT")
	api.HandleFunc("/commands/{id}", handlers.DeleteCommand).Methods("DELETE")

	// Rules
	api.HandleFunc("/rules", handlers.GetRules).Methods("GET")
	api.HandleFunc("/rules", handlers.CreateRule).Methods("POST")
	api.HandleFunc("/rules/{id}", handlers.UpdateRule).Methods("PUT")
	api.HandleFunc("/rules/{id}", handlers.DeleteRule).Methods("DELETE")

	// Payment Methods
	api.HandleFunc("/payment-methods", handlers.GetPaymentMethods).Methods("GET")
	api.HandleFunc("/payment-methods", handlers.CreatePaymentMethod).Methods("POST")
	api.HandleFunc("/payment-methods/{id}", handlers.UpdatePaymentMethod).Methods("PUT")
	api.HandleFunc("/payment-methods/{id}", handlers.DeletePaymentMethod).Methods("DELETE")

	// Legal Documents
	api.HandleFunc("/legal-documents", handlers.GetLegalDocuments).Methods("GET")
	api.HandleFunc("/legal-documents", handlers.CreateLegalDocument).Methods("POST")
	api.HandleFunc("/legal-documents/{id}", handlers.UpdateLegalDocument).Methods("PUT")
	api.HandleFunc("/legal-documents/{id}", handlers.DeleteLegalDocument).Methods("DELETE")

	// Players
	api.HandleFunc("/players", handlers.GetPlayers).Methods("GET")
	api.HandleFunc("/players/{steamid}", handlers.GetPlayer).Methods("GET")

	// Stats sync (receive from TopSystem plugin)
	api.HandleFunc("/stats/sync", handlers.ReceiveStatsSync).Methods("POST")

	// Import (sync from game server files)
	api.HandleFunc("/import/clans", handlers.ImportClans).Methods("POST")
	api.HandleFunc("/import/players", handlers.ImportPlayers).Methods("POST")
	api.HandleFunc("/import/stats", handlers.ImportStats).Methods("POST")

	// Clans
	api.HandleFunc("/clans", handlers.GetClans).Methods("GET")
	api.HandleFunc("/clans", handlers.CreateClan).Methods("POST")
	api.HandleFunc("/clans/{id}", handlers.GetClan).Methods("GET")
	api.HandleFunc("/clans/{id}", handlers.UpdateClan).Methods("PUT")
	api.HandleFunc("/clans/{id}", handlers.DeleteClan).Methods("DELETE")

	// Shop
	api.HandleFunc("/shop/categories", handlers.GetShopCategories).Methods("GET")
	api.HandleFunc("/shop/categories", handlers.CreateShopCategory).Methods("POST")
	api.HandleFunc("/shop/categories/{id}", handlers.UpdateShopCategory).Methods("PUT")
	api.HandleFunc("/shop/categories/{id}", handlers.DeleteShopCategory).Methods("DELETE")
	api.HandleFunc("/shop/items", handlers.GetShopItems).Methods("GET")
	api.HandleFunc("/shop/items", handlers.CreateShopItem).Methods("POST")
	api.HandleFunc("/shop/items/{id}", handlers.UpdateShopItem).Methods("PUT")
	api.HandleFunc("/shop/items/{id}", handlers.DeleteShopItem).Methods("DELETE")

	// Theme & Fonts
	api.HandleFunc("/theme", handlers.GetTheme).Methods("GET")
	api.HandleFunc("/theme", handlers.UpdateTheme).Methods("PUT")
	api.HandleFunc("/font-settings", handlers.GetFontSettings).Methods("GET")
	api.HandleFunc("/font-settings", handlers.UpdateFontSettings).Methods("PUT")

	// Currency (public)
	api.HandleFunc("/currency/rates", handlers.GetCurrencyRates).Methods("GET")

	// Download Links
	api.HandleFunc("/download-links", handlers.GetDownloadLinks).Methods("GET")
	api.HandleFunc("/download-links", handlers.CreateDownloadLink).Methods("POST")
	api.HandleFunc("/download-links/{id}", handlers.UpdateDownloadLink).Methods("PUT")
	api.HandleFunc("/download-links/{id}", handlers.DeleteDownloadLink).Methods("DELETE")

	// RCON (protected - admin only)
	api.HandleFunc("/rcon/execute", handlers.ExecuteRcon).Methods("POST")
}
