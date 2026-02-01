package main

import (
	"log"
	"net/http"
	"os"

	"rust-legacy-site/database"
	"rust-legacy-site/routes"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if err := database.Seed(); err != nil {
		log.Printf("Seed warning: %v", err)
	}
	if err := database.SeedClansIfEmpty(); err != nil {
		log.Printf("SeedClansIfEmpty warning: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := mux.NewRouter()
	routes.Setup(r)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	log.Printf("Server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
