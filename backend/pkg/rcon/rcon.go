package rcon

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	gorcon "github.com/gorcon/rcon"
)

// Execute sends RCON command to the game server. Replace * with steamID in command.
func Execute(host string, port int, password string, command string, steamID string) (string, error) {
	if host == "" || port == 0 || password == "" {
		return "", fmt.Errorf("rcon: missing host, port or password")
	}

	addr := fmt.Sprintf("%s:%d", host, port)
	conn, err := gorcon.Dial(addr, password)
	if err != nil {
		return "", fmt.Errorf("rcon connect: %w", err)
	}
	defer conn.Close()

	// Replace * placeholder with SteamID
	cmd := strings.ReplaceAll(command, "*", steamID)
	resp, err := conn.Execute(cmd)
	if err != nil {
		return "", fmt.Errorf("rcon execute: %w", err)
	}
	return resp, nil
}

// ExecuteSimple sends command without SteamID replacement (for admin commands)
func ExecuteSimple(command string) (string, error) {
	host := os.Getenv("RCON_HOST")
	port := 0
	if p := os.Getenv("RCON_PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	if port == 0 {
		port = 28016 // Rust Legacy default RCON
	}
	password := os.Getenv("RCON_PASSWORD")
	return Execute(host, port, password, command, "")
}
