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
func Query(ip string, port int) Info {
	addr := fmt.Sprintf("%s:%d", ip, port)

	info := Info{
		Status:     "Offline",
		Players:    0,
		MaxPlayers: 0,
		Time:       time.Now().Unix(),
	}

	conn, err := net.DialTimeout("udp", addr, 2*time.Second)
	if err != nil {
		return info
	}
	defer conn.Close()

	// A2S_INFO request
	request := []byte{0xFF, 0xFF, 0xFF, 0xFF, 0x54}
	request = append(request, []byte("Source Engine Query\x00")...)

	conn.SetDeadline(time.Now().Add(2 * time.Second))
	if _, err := conn.Write(request); err != nil {
		return info
	}

	buffer := make([]byte, 4096)
	n, err := conn.Read(buffer)
	if err != nil || n < 6 {
		return info
	}

	info.Status = "Online"
	reader := bytes.NewReader(buffer[6:n])

	info.Name = readCString(reader)
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
