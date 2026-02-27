package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"rust-legacy-site/database"
	"rust-legacy-site/handlers"
	"rust-legacy-site/routes"
	"rust-legacy-site/pkg/statssync"
	"rust-legacy-site/pkg/onlinehistory"

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
	if err := database.SeedAdminIfEmpty(); err != nil {
		log.Printf("SeedAdminIfEmpty warning: %v", err)
	}
	if err := database.SeedClansIfEmpty(); err != nil {
		log.Printf("SeedClansIfEmpty warning: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
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

	// Stats sync every 2 minutes
	go func() {
		statssync.Run() // run immediately
		ticker := time.NewTicker(2 * time.Minute)
		for range ticker.C {
			statssync.Run()
		}
	}()

	// Server status cache — обновление раз в 10 сек, первый прогрев сразу
	go handlers.InitServerStatusCache()

	// Online history collector every 5 minutes (fallback when plugin doesn't report)
	go func() {
		onlinehistory.Collect()
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			onlinehistory.Collect()
		}
	}()

	if w := os.Getenv("PAYGATE_MERCHANT_WALLET"); w != "" {
		log.Printf("PayGate: configured (wallet set)")
	} else {
		log.Printf("PayGate: NOT configured - set PAYGATE_MERCHANT_WALLET")
	}
	log.Printf("Server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
