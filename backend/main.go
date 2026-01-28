package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	log.Println("Connecting to database...")
	
	time.Sleep(5 * time.Second)
	
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Running migrations...")
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Seeding database...")
	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Server Info
	api.HandleFunc("/server-info", handlers.GetServerInfo).Methods("GET")
	api.HandleFunc("/server-info", handlers.UpdateServerInfo).Methods("PUT")
	api.HandleFunc("/servers", handlers.GetAllServers).Methods("GET")

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

	// How To Start Steps
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

	// Shop Categories
	api.HandleFunc("/shop/categories", handlers.GetShopCategories).Methods("GET")
	api.HandleFunc("/shop/categories", handlers.CreateShopCategory).Methods("POST")
	api.HandleFunc("/shop/categories/{id}", handlers.UpdateShopCategory).Methods("PUT")
	api.HandleFunc("/shop/categories/{id}", handlers.DeleteShopCategory).Methods("DELETE")

	// Shop Items
	api.HandleFunc("/shop/items", handlers.GetShopItems).Methods("GET")
	api.HandleFunc("/shop/items", handlers.CreateShopItem).Methods("POST")
	api.HandleFunc("/shop/items/{id}", handlers.UpdateShopItem).Methods("PUT")
	api.HandleFunc("/shop/items/{id}", handlers.DeleteShopItem).Methods("DELETE")

	// Theme
	api.HandleFunc("/theme", handlers.GetTheme).Methods("GET")
	api.HandleFunc("/theme", handlers.UpdateTheme).Methods("PUT")

	// Font Settings
	api.HandleFunc("/font-settings", handlers.GetFontSettings).Methods("GET")
	api.HandleFunc("/font-settings", handlers.UpdateFontSettings).Methods("PUT")

	// Server Status
	api.HandleFunc("/server-status", handlers.GetServerStatus).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
