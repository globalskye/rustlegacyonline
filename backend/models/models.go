package models

import (
	"time"
)

type ServerInfo struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `json:"name"`
	MaxPlayers    int       `json:"maxPlayers"`
	GameVersion   string    `json:"gameVersion"`
	DownloadURL   string    `json:"downloadUrl"`
	VirusTotalURL string    `json:"virusTotalUrl"`
	Type          string    `json:"type"`
	IP            string    `json:"ip"`
	Port          int       `json:"port"`       // game port (for connect)
	QueryPort     int       `json:"queryPort"`  // A2S_INFO query port (often game port + 1)
	Order         int       `json:"order" gorm:"column:sort_order"` // приоритет: меньше = выше
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Description struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	ServerInfoID uint   `json:"serverInfoId"`
	Language     string `json:"language"`
	Content      string `json:"content" gorm:"type:text"`
}

type Feature struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ServerInfoID uint      `json:"serverInfoId"`
	Language     string    `json:"language"`
	Title        string    `json:"title"`
	Description  string    `json:"description" gorm:"type:text"`
	Icon         string    `json:"icon"`
	Order        int       `json:"order"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type News struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Language    string    `json:"language"`
	Title       string    `json:"title"`
	Content     string    `json:"content" gorm:"type:text"`
	ImageURL    string    `json:"imageUrl"`
	Published   bool      `json:"published"`
	PublishedAt time.Time `json:"publishedAt"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type HowToStartStep struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Language    string    `json:"language"`
	StepNumber  int       `json:"stepNumber"`
	Title       string    `json:"title"`
	Content     string    `json:"content" gorm:"type:text"`
	ImageURL    string    `json:"imageUrl"`
	VideoURL    string    `json:"videoUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ServerDetail struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ServerID  uint      `json:"serverId"` // 0 = all servers
	Language  string    `json:"language"`
	Section   string    `json:"section"`
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	ImageURL  string    `json:"imageUrl"`
	VideoURL  string    `json:"videoUrl"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Plugin struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ServerID    uint      `json:"serverId"` // 0 = all servers
	Language    string    `json:"language"`
	Name        string    `json:"name"`
	Description string    `json:"description" gorm:"type:text"`
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Commands    []Command `gorm:"foreignKey:PluginID" json:"commands"`
}

type Command struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	PluginID    uint   `json:"pluginId"`
	Command     string `json:"command"`
	Description string `json:"description" gorm:"type:text"`
	Usage       string `json:"usage"`
}

type Rule struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Language  string    `json:"language"`
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type PaymentMethod struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"imageUrl"`
	Order    int    `json:"order"`
	Enabled  bool   `json:"enabled"`
}

type LegalDocument struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Language  string    `json:"language"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Clan - Rust Legacy format [0x38471ABB] NAME=WaR ABBREV= LEADER=...
// Public: Name, Abbrev, LeaderSteamID, Level, Experience, MemberCount, Tax, Created
// Hidden: Balance, Location, MOTD (optional)
type Clan struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	HexID           string    `json:"hexId" gorm:"uniqueIndex"` // e.g. "0x38471ABB"
	Name            string    `json:"name"`
	Abbrev          string    `json:"abbrev"`           // e.g. "[GGWP]" or "PRASE"
	LeaderSteamID   string    `json:"leaderSteamId"`    // SteamID of leader
	Created         time.Time `json:"created"`
	Level           int       `json:"level"`
	Experience      int       `json:"experience"`
	MemberCount     int       `json:"memberCount"`
	Tax             int       `json:"tax"`              // 0-100 %
	Balance         int       `json:"-"`                // hidden from public API
	Location        string    `json:"-"`                // hidden - privacy
	MOTD            string    `json:"motd,omitempty"`   // message of the day
	Flags           string    `json:"-"`                // can_motd,can_abbr,etc - internal
	UpdatedAt       time.Time `json:"updatedAt"`
	Members         []ClanMember `gorm:"foreignKey:ClanID" json:"members,omitempty"`
	LeaderUsername  string    `json:"leaderUsername,omitempty" gorm:"-"` // resolved for display
	Rank            int       `json:"rank" gorm:"-"`    // computed for leaderboard
}

// ClanMember - MEMBER=76561197970954269,invite,dismiss,management
type ClanMember struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	ClanID      uint   `json:"clanId"`
	SteamID     string `json:"steamId"`
	Permissions string `json:"permissions"` // "invite,dismiss,management" or "0"
}

// Player - Rust Legacy format [76561197961407422] USERNAME= KILLEDPLAYERS= DEATHS=...
// Public: Username, SteamID, Rank, Language, KilledPlayers, KilledMutants, KilledAnimals, Deaths, PlayTime, FirstConnect, LastConnect, Clan
// Hidden: Password, HWID, IP, Balance, Violations, Position
type Player struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	SteamID          string     `json:"steamId" gorm:"uniqueIndex"`
	Username         string     `json:"username"`
	Rank             int        `json:"rank"`
	Language         string     `json:"language"`
	KilledPlayers    int        `json:"killedPlayers"`    // PvP kills
	KilledMutants    int        `json:"killedMutants"`
	KilledAnimals    int        `json:"killedAnimals"`
	Deaths           int        `json:"deaths"`
	PlayTime         int        `json:"playTime"`         // TimeMinutes
	FirstConnectDate time.Time  `json:"firstConnectDate"`
	LastConnectDate  time.Time  `json:"lastConnectDate"`
	ClanID           *uint      `json:"clanId"`
	Clan             *Clan      `gorm:"foreignKey:ClanID" json:"clan,omitempty"`
	IsOnline         bool       `json:"isOnline"`
	Balance          int        `json:"-"`               // hidden
	Violations       int        `json:"-"`               // hidden - admin only
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
	Stats            *PlayerStats `gorm:"-" json:"stats,omitempty"` // loaded separately by SteamID
	RankPosition     int        `json:"rankPosition" gorm:"-"` // computed leaderboard pos
}

// PlayerStats - extended stats from JSON { "76561197961407422": { "RaidObjects": 0, "TimeMinutes": 981, ... } }
type PlayerStats struct {
	SteamID     string `gorm:"primaryKey" json:"steamId"`
	RaidObjects int    `json:"raidObjects"`
	TimeMinutes int    `json:"timeMinutes"`
	Wood        int    `json:"wood"`
	Metal       int    `json:"metal"`
	Sulfur      int    `json:"sulfur"`
	Leather     int    `json:"leather"`
	Cloth       int    `json:"cloth"`
	Fat         int    `json:"fat"`
	Suicides    int    `json:"suicides"`
}

// AdminUser for admin panel authentication
type AdminUser struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `json:"username" gorm:"uniqueIndex"`
	PasswordHash string    `json:"-" gorm:"column:password_hash"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Setting struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `json:"key" gorm:"uniqueIndex"`
	Value     string    `json:"value" gorm:"type:text"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ShopCategory struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Name     string    `json:"name"`
	Language string    `json:"language"`
	Order    int       `json:"order"`
	Enabled  bool      `json:"enabled"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ShopItem struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CategoryID      uint      `json:"categoryId"`
	Language        string    `json:"language"`
	Name            string    `json:"name"`
	Description     string    `json:"description" gorm:"type:text"`
	Price           float64   `json:"price"`
	Currency        string    `json:"currency"`
	ImageURL        string    `json:"imageUrl"`
	Enabled         bool      `json:"enabled"`
	Order           int       `json:"order"`
	Features        string    `json:"features" gorm:"type:text"`
	Discount        int       `json:"discount"`
	RconCommand     string    `json:"rconCommand"`
	Warranty        string    `json:"warranty" gorm:"type:text"`           // гарантийные условия
	Specs           string    `json:"specs" gorm:"type:text"`              // характеристики
	PackageContents string    `json:"packageContents" gorm:"type:text"`    // комплектация
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}


// DownloadLink - multiple download links for the game client
type DownloadLink struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ServerInfoID uint      `json:"serverInfoId"`
	Label        string    `json:"label"`        // e.g. "Google Drive", "Mirror 1"
	URL          string    `json:"url"`
	Order        int       `json:"order"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Theme struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	Name            string `json:"name"`
	PrimaryColor    string `json:"primaryColor"`
	AccentColor     string `json:"accentColor"`
	BackgroundColor string `json:"backgroundColor"`
	CardBackground  string `json:"cardBackground"`
	TextPrimary     string `json:"textPrimary"`
	TextSecondary   string `json:"textSecondary"`
	BorderColor     string `json:"borderColor"`
	GlowColor       string `json:"glowColor"`
	IsActive        bool   `json:"isActive"`
}

type FontSettings struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	HeadingFont string `json:"headingFont"`
	BodyFont    string `json:"bodyFont"`
	H1Size      string `json:"h1Size"`
	H2Size      string `json:"h2Size"`
	H3Size      string `json:"h3Size"`
	BodySize    string `json:"bodySize"`
}

// CompanyInfo - обязательная информация об организации (для размещения на сайте, эквайринг РБ)
type CompanyInfo struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	LegalName          string    `json:"legalName" gorm:"type:text"`           // наименование юр. лица / ИП
	Address            string    `json:"address" gorm:"type:text"`            // юридический/почтовый адрес (с указанием страны)
	Phone              string    `json:"phone"`                               // номер телефона
	Email              string    `json:"email"`                               // email для связи
	INN                string    `json:"inn"`                                // ИНН (РФ)
	OGRN               string    `json:"ogrn"`                               // ОГРН (РФ)
	UNP                string    `json:"unp"`                                // УНП (Беларусь)
	RegistrationInfo   string    `json:"registrationInfo" gorm:"type:text"`   // сведения о гос. регистрации
	TradeRegistryNum   string    `json:"tradeRegistryNum"`                    // номер в Торговом реестре
	TradeRegistryDate  string    `json:"tradeRegistryDate"`                   // дата регистрации в Торговом реестре
	WorkingHours       string    `json:"workingHours"`                        // режим работы
	StoreName          string    `json:"storeName"`                           // наименование интернет-магазина
	Licenses           string    `json:"licenses" gorm:"type:text"`           // лицензии (если применимо)
	BankRequisites     string    `json:"bankRequisites" gorm:"type:text"`      // банковские реквизиты
	DeliveryInfo       string    `json:"deliveryInfo" gorm:"type:text"`        // информация о доставке
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// OnlineHistory - история онлайна для графика
type OnlineHistory struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ServerID   uint      `json:"serverId"`
	ServerType string    `json:"serverType"`
	Players    int       `json:"players"`
	RecordedAt time.Time `json:"recordedAt"`
}

type ServerStatus struct {
	ServerID       uint      `json:"serverId"`
	ServerName     string    `json:"serverName"`
	ServerType     string    `json:"serverType"`
	IsOnline       bool      `json:"isOnline"`
	CurrentPlayers int       `json:"currentPlayers"`
	MaxPlayers     int       `json:"maxPlayers"`
	Map            string    `json:"map"`
	Uptime         int64     `json:"uptime"`
	IP             string    `json:"ip"`
	Port           int       `json:"port"`
	ActivePlayers  []Player  `json:"activePlayers"`
}
