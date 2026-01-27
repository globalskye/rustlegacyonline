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
	// Подключаемся к базе данных
	log.Println("Connecting to database...")
	
	// Ждем, пока postgres запустится
	time.Sleep(5 * time.Second)
	
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Мигрируем схему
	log.Println("Running migrations...")
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Заполняем начальными данными
	log.Println("Seeding database...")
	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Server Info
	api.HandleFunc("/server-info", handlers.GetServerInfo).Methods("GET")
	api.HandleFunc("/server-info", handlers.UpdateServerInfo).Methods("PUT")

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

	// Players
	api.HandleFunc("/players", handlers.GetPlayers).Methods("GET")
	api.HandleFunc("/players/{steamid}", handlers.GetPlayer).Methods("GET")

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
