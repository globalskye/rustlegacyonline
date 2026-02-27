package routes

import (
	"net/http"

	"rust-legacy-site/handlers"
	authpkg "rust-legacy-site/pkg/auth"

	"github.com/gorilla/mux"
)

// Setup configures all API routes
func Setup(r *mux.Router) {
	api := r.PathPrefix("/api").Subrouter()

	// Health
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Contact form (email)
	api.HandleFunc("/contact", handlers.SendContact).Methods("POST")

	// Embed preview for Discord/VK etc - dynamic OG with online + download link
	api.HandleFunc("/embed", handlers.EmbedPreview).Methods("GET")

	// Auth (public)
	api.HandleFunc("/auth/login", handlers.Login).Methods("POST")
	api.HandleFunc("/auth/register", handlers.Register).Methods("POST")
	api.HandleFunc("/auth/me", handlers.AuthMe).Methods("GET")

	// Company Info (GET public, PUT protected)
	api.HandleFunc("/company-info", handlers.GetCompanyInfo).Methods("GET")
	api.Handle("/company-info", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateCompanyInfo))).Methods("PUT")

	// Server Info (GET public, PUT protected)
	api.HandleFunc("/server-info", handlers.GetServerInfo).Methods("GET")
	api.Handle("/server-info", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateServerInfo))).Methods("PUT")
	api.HandleFunc("/servers", handlers.GetAllServers).Methods("GET")
	api.Handle("/servers", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateServer))).Methods("POST")
	api.Handle("/servers/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateServer))).Methods("PUT")
	api.Handle("/servers/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteServer))).Methods("DELETE")

	// Server Status (live query). ?type=classic or ?type=deathmatch for specific server
	api.HandleFunc("/server-status", handlers.GetServerStatus).Methods("GET")
	api.HandleFunc("/server-status/classic", handlers.GetServerStatusClassic).Methods("GET")
	api.HandleFunc("/server-status/deathmatch", handlers.GetServerStatusDeathmatch).Methods("GET")
	api.HandleFunc("/server-status/report", handlers.ReportServerOnline).Methods("POST")
	api.HandleFunc("/server-status/history", handlers.GetOnlineHistory).Methods("GET")

	// Features
	api.HandleFunc("/features", handlers.GetFeatures).Methods("GET")
	api.Handle("/features", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateFeature))).Methods("POST")
	api.Handle("/features/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateFeature))).Methods("PUT")
	api.Handle("/features/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteFeature))).Methods("DELETE")

	// News
	api.HandleFunc("/news", handlers.GetNews).Methods("GET")
	api.Handle("/news", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateNews))).Methods("POST")
	api.HandleFunc("/news/{id}", handlers.GetNewsItem).Methods("GET")
	api.Handle("/news/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateNews))).Methods("PUT")
	api.Handle("/news/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteNews))).Methods("DELETE")

	// How to Start
	api.HandleFunc("/how-to-start", handlers.GetHowToStartSteps).Methods("GET")
	api.Handle("/how-to-start", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateHowToStartStep))).Methods("POST")
	api.Handle("/how-to-start/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateHowToStartStep))).Methods("PUT")
	api.Handle("/how-to-start/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteHowToStartStep))).Methods("DELETE")

	// Server Details
	api.HandleFunc("/server-details", handlers.GetServerDetails).Methods("GET")
	api.Handle("/server-details", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateServerDetail))).Methods("POST")
	api.Handle("/server-details/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateServerDetail))).Methods("PUT")
	api.Handle("/server-details/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteServerDetail))).Methods("DELETE")

	// Plugins
	api.HandleFunc("/plugins", handlers.GetPlugins).Methods("GET")
	api.Handle("/plugins", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreatePlugin))).Methods("POST")
	api.Handle("/plugins/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdatePlugin))).Methods("PUT")
	api.Handle("/plugins/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeletePlugin))).Methods("DELETE")

	// Commands
	api.Handle("/commands", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateCommand))).Methods("POST")
	api.Handle("/commands/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateCommand))).Methods("PUT")
	api.Handle("/commands/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteCommand))).Methods("DELETE")

	// Rules
	api.HandleFunc("/rules", handlers.GetRules).Methods("GET")
	api.Handle("/rules", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateRule))).Methods("POST")
	api.Handle("/rules/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateRule))).Methods("PUT")
	api.Handle("/rules/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteRule))).Methods("DELETE")

	// Payment Methods
	api.HandleFunc("/payment-methods", handlers.GetPaymentMethods).Methods("GET")
	api.Handle("/payment-methods", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreatePaymentMethod))).Methods("POST")
	api.Handle("/payment-methods/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdatePaymentMethod))).Methods("PUT")
	api.Handle("/payment-methods/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeletePaymentMethod))).Methods("DELETE")

	// Legal Documents
	api.HandleFunc("/legal-documents", handlers.GetLegalDocuments).Methods("GET")
	api.Handle("/legal-documents", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateLegalDocument))).Methods("POST")
	api.Handle("/legal-documents/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateLegalDocument))).Methods("PUT")
	api.Handle("/legal-documents/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteLegalDocument))).Methods("DELETE")

	// Players
	api.HandleFunc("/players", handlers.GetPlayers).Methods("GET")
	api.HandleFunc("/players/{steamid}", handlers.GetPlayer).Methods("GET")

	// Stats sync (receive from TopSystem plugin). GET — проверка, POST — приём данных
	api.HandleFunc("/stats/sync", handlers.ReceiveStatsSync).Methods("GET", "POST")

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
	api.Handle("/shop/categories", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateShopCategory))).Methods("POST")
	api.Handle("/shop/categories/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateShopCategory))).Methods("PUT")
	api.Handle("/shop/categories/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteShopCategory))).Methods("DELETE")
	api.HandleFunc("/shop/items", handlers.GetShopItems).Methods("GET")
	api.Handle("/shop/items", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateShopItem))).Methods("POST")
	api.Handle("/shop/items/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateShopItem))).Methods("PUT")
	api.Handle("/shop/items/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteShopItem))).Methods("DELETE")

	// Theme & Fonts
	api.HandleFunc("/theme", handlers.GetTheme).Methods("GET")
	api.Handle("/theme", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateTheme))).Methods("PUT")
	api.HandleFunc("/font-settings", handlers.GetFontSettings).Methods("GET")
	api.Handle("/font-settings", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateFontSettings))).Methods("PUT")

	// Currency (public)
	api.HandleFunc("/currency/rates", handlers.GetCurrencyRates).Methods("GET")

	// Download Links
	api.HandleFunc("/download-links", handlers.GetDownloadLinks).Methods("GET")
	api.Handle("/download-links", authpkg.AdminMiddleware(http.HandlerFunc(handlers.CreateDownloadLink))).Methods("POST")
	api.Handle("/download-links/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateDownloadLink))).Methods("PUT")
	api.Handle("/download-links/{id}", authpkg.AdminMiddleware(http.HandlerFunc(handlers.DeleteDownloadLink))).Methods("DELETE")

	// RCON (protected)
	api.Handle("/rcon/execute", authpkg.AdminMiddleware(http.HandlerFunc(handlers.ExecuteRcon))).Methods("POST")

	// Site Config (GET public, PUT protected)
	api.HandleFunc("/site-config", handlers.GetSiteConfig).Methods("GET")
	api.Handle("/site-config", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateSiteConfig))).Methods("PUT")

	// Checkout (optional auth for paygate, required for balance)
	api.Handle("/checkout", authpkg.OptionalAuthMiddleware(http.HandlerFunc(handlers.CreateCheckout))).Methods("POST")

	// Balance top-up (user auth required)
	api.Handle("/balance/topup", authpkg.UserMiddleware(http.HandlerFunc(handlers.BalanceTopup))).Methods("POST")

	// PayGate webhook (no auth)
	api.HandleFunc("/webhooks/paygate", handlers.PaygateWebhook).Methods("GET", "POST")

	// Admin (protected)
	api.Handle("/admin/clear-clans-players", authpkg.AdminMiddleware(http.HandlerFunc(handlers.ClearClansAndPlayers))).Methods("DELETE")
	api.Handle("/admin/social", authpkg.AdminMiddleware(http.HandlerFunc(handlers.GetSocialConfig))).Methods("GET")
	api.Handle("/admin/social", authpkg.AdminMiddleware(http.HandlerFunc(handlers.UpdateSocialConfig))).Methods("PUT")
}
