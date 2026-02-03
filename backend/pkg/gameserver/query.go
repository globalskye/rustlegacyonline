package gameserver

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"net"
	"time"
)

// Info represents Source engine A2S_INFO response
type Info struct {
	Name       string `json:"name"`
	Map        string `json:"map"`
	Game       string `json:"game"`
	Players    int    `json:"players"`
	MaxPlayers int    `json:"max_players"`
	Status     string `json:"status"`
	Time       int64  `json:"time"`
}

func readCString(buf *bytes.Reader) string {
	var result []byte
	for {
		b, err := buf.ReadByte()
		if err != nil || b == 0x00 {
			break
		}
		result = append(result, b)
	}
	return string(result)
}

// Query performs A2S_INFO query on a Source engine server (e.g. Rust Legacy)
// Use queryPort for A2S_INFO (often gamePort+1). If queryPort is 0, uses port.
func Query(ip string, port int, queryPort int) Info {
	qport := queryPort
	if qport <= 0 {
		qport = port + 1 // Rust Legacy: query port = game port + 1
	}
	addr := fmt.Sprintf("%s:%d", ip, qport)

	info := Info{
		Status:     "Offline",
		Players:    0,
		MaxPlayers: 0,
		Time:       time.Now().Unix(),
	}

	conn, err := net.DialTimeout("udp", addr, 3*time.Second)
	if err != nil {
		return info
	}
	defer conn.Close()

	conn.SetDeadline(time.Now().Add(3 * time.Second))

	// A2S_INFO request
	request := []byte{0xFF, 0xFF, 0xFF, 0xFF, 0x54}
	request = append(request, []byte("Source Engine Query\x00")...)

	if _, err := conn.Write(request); err != nil {
		return info
	}

	buffer := make([]byte, 4096)
	n, err := conn.Read(buffer)
	if err != nil || n < 5 {
		return info
	}

	// Handle A2S_CHALLENGE (0x41) - resend with challenge
	if n >= 9 && buffer[4] == 0x41 {
		challenge := buffer[5:9]
		request = []byte{0xFF, 0xFF, 0xFF, 0xFF, 0x54}
		request = append(request, challenge...)
		request = append(request, []byte("Source Engine Query\x00")...)
		conn.SetDeadline(time.Now().Add(3 * time.Second))
		if _, err := conn.Write(request); err != nil {
			return info
		}
		n, err = conn.Read(buffer)
		if err != nil || n < 6 {
			return info
		}
	}

	if n < 6 || buffer[4] != 0x49 {
		return info
	}

	info.Status = "Online"
	reader := bytes.NewReader(buffer[5:n])

	info.Name = readCString(reader)
	if info.Name == "" {
		info.Name = "Rust Legacy"
	}
	info.Map = readCString(reader)
	_ = readCString(reader) // folder
	info.Game = readCString(reader)

	var appID uint16
	binary.Read(reader, binary.LittleEndian, &appID)

	players, _ := reader.ReadByte()
	maxPlayers, _ := reader.ReadByte()

	info.Players = int(players)
	info.MaxPlayers = int(maxPlayers)

	return info
}
