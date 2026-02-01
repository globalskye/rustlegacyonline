package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"rust-legacy-site/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

var DB *gorm.DB

func Connect() error {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = ""
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "rustlegacy"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")
	return nil
}

func Migrate() error {
	err := DB.AutoMigrate(
		&models.ServerInfo{},
		&models.Description{},
		&models.Feature{},
		&models.News{},
		&models.HowToStartStep{},
		&models.ServerDetail{},
		&models.Plugin{},
		&models.Command{},
		&models.Rule{},
		&models.PaymentMethod{},
		&models.LegalDocument{},
		&models.Clan{},
		&models.ClanMember{},
		&models.Player{},
		&models.PlayerStats{},
		&models.AdminUser{},
		&models.Setting{},
		&models.ShopCategory{},
		&models.ShopItem{},
		&models.Theme{},
		&models.FontSettings{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func Seed() error {
	var count int64
	DB.Model(&models.ServerInfo{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded")
		return nil
	}

	// ========================================
	// SERVER INFO - 2 SERVERS
	// ========================================
	serverClassic := models.ServerInfo{
		Name:          "Rust Legacy Classic",
		MaxPlayers:    100,
		GameVersion:   "Legacy",
		Type:          "classic",
		IP:            "185.202.223.101",
		Port:          28015,
		DownloadURL:   "https://example.com/download/rust-legacy-client.zip",
		VirusTotalURL: "https://www.virustotal.com/gui/file/YOUR_FILE_HASH",
	}
	if err := DB.Create(&serverClassic).Error; err != nil {
		return err
	}

	serverDM := models.ServerInfo{
		Name:          "Rust Legacy Deathmatch",
		MaxPlayers:    50,
		GameVersion:   "Legacy",
		Type:          "deathmatch",
		IP:            "185.202.223.102",
		Port:          28016,
		DownloadURL:   "https://example.com/download/rust-legacy-client.zip",
		VirusTotalURL: "https://www.virustotal.com/gui/file/YOUR_FILE_HASH",
	}
	if err := DB.Create(&serverDM).Error; err != nil {
		return err
	}

	// Descriptions
	descriptions := []models.Description{
		{ServerInfoID: serverClassic.ID, Language: "en", Content: "Experience the classic Rust Legacy gameplay with balanced x1 rates. Build, survive, and dominate!"},
		{ServerInfoID: serverClassic.ID, Language: "ru", Content: "Испытайте классический геймплей Rust Legacy со сбалансированными рейтами x1. Стройте, выживайте и доминируйте!"},
		{ServerInfoID: serverDM.ID, Language: "en", Content: "Fast-paced deathmatch arena for those who love intense PvP action!"},
		{ServerInfoID: serverDM.ID, Language: "ru", Content: "Быстрая арена для тех, кто любит интенсивный PvP!"},
	}
	for _, desc := range descriptions {
		if err := DB.Create(&desc).Error; err != nil {
			return err
		}
	}

	// ========================================
	// FEATURES
	// ========================================
	features := []models.Feature{
		{ServerInfoID: serverClassic.ID, Language: "en", Title: "Classic x1 Rates", Description: "Pure vanilla experience with balanced gathering", Icon: "zap", Order: 1},
		{ServerInfoID: serverClassic.ID, Language: "ru", Title: "Классические x1 рейты", Description: "Чистый ванильный опыт со сбалансированным сбором", Icon: "zap", Order: 1},
		{ServerInfoID: serverClassic.ID, Language: "en", Title: "Active Community", Description: "Join hundreds of players in our community", Icon: "users", Order: 2},
		{ServerInfoID: serverClassic.ID, Language: "ru", Title: "Активное сообщество", Description: "Присоединяйтесь к сотням игроков в нашем сообществе", Icon: "users", Order: 2},
		{ServerInfoID: serverClassic.ID, Language: "en", Title: "24/7 Uptime", Description: "Reliable server with 99.9% uptime", Icon: "server", Order: 3},
		{ServerInfoID: serverClassic.ID, Language: "ru", Title: "24/7 Доступность", Description: "Надежный сервер с 99.9% аптаймом", Icon: "server", Order: 3},
		{ServerInfoID: serverClassic.ID, Language: "en", Title: "Fair Play", Description: "Active admins ensuring fair gameplay", Icon: "shield", Order: 4},
		{ServerInfoID: serverClassic.ID, Language: "ru", Title: "Честная игра", Description: "Активные админы обеспечивают честный геймплей", Icon: "shield", Order: 4},
	}
	for _, feature := range features {
		if err := DB.Create(&feature).Error; err != nil {
			return err
		}
	}

	// ========================================
	// HOW TO START STEPS
	// ========================================
	howToStartSteps := []models.HowToStartStep{
		{Language: "en", StepNumber: 1, Title: "Download the Client", Content: "<p>Download our custom Rust Legacy client from the link above.</p>", ImageURL: "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Download+Client"},
		{Language: "ru", StepNumber: 1, Title: "Скачайте клиент", Content: "<p>Скачайте наш кастомный клиент Rust Legacy по ссылке выше.</p>", ImageURL: "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Download+Client"},
		{Language: "en", StepNumber: 2, Title: "Verify the Download", Content: "<p>For your security, verify the downloaded file on VirusTotal.</p>", ImageURL: "https://via.placeholder.com/600x400/06b6d4/ffffff?text=Verify+Download"},
		{Language: "ru", StepNumber: 2, Title: "Проверьте загрузку", Content: "<p>Для вашей безопасности проверьте скачанный файл на VirusTotal.</p>", ImageURL: "https://via.placeholder.com/600x400/06b6d4/ffffff?text=Verify+Download"},
		{Language: "en", StepNumber: 3, Title: "Install and Launch", Content: "<p>Extract the archive and run RustLegacy.exe.</p>", ImageURL: "https://via.placeholder.com/600x400/14b8a6/ffffff?text=Install+Game"},
		{Language: "ru", StepNumber: 3, Title: "Установите и запустите", Content: "<p>Извлеките архив и запустите RustLegacy.exe.</p>", ImageURL: "https://via.placeholder.com/600x400/14b8a6/ffffff?text=Install+Game"},
		{Language: "en", StepNumber: 4, Title: "Start Playing!", Content: "<p>You're all set! Use /kit starter for free starter kit.</p>", ImageURL: "https://via.placeholder.com/600x400/0284c7/ffffff?text=Start+Playing"},
		{Language: "ru", StepNumber: 4, Title: "Начинайте играть!", Content: "<p>Все готово! Используйте /kit starter для стартового набора.</p>", ImageURL: "https://via.placeholder.com/600x400/0284c7/ffffff?text=Start+Playing"},
	}
	for _, step := range howToStartSteps {
		if err := DB.Create(&step).Error; err != nil {
			return err
		}
	}

	// ========================================
	// SERVER DETAILS
	// ========================================
	serverDetails := []models.ServerDetail{
		{Language: "en", Section: "description", Title: "Server Type", Content: "<p>Classic Rust Legacy x1 vanilla server.</p>", Order: 1},
		{Language: "ru", Section: "description", Title: "Тип сервера", Content: "<p>Классический Rust Legacy x1 ванильный сервер.</p>", Order: 1},
	}
	for _, detail := range serverDetails {
		if err := DB.Create(&detail).Error; err != nil {
			return err
		}
	}

	// ========================================
	// PLUGINS
	// ========================================
	plugins := []models.Plugin{
		{Language: "en", Name: "Teleport System", Description: "Set home locations and teleport with cooldowns", Order: 1},
		{Language: "ru", Name: "Система телепортации", Description: "Устанавливайте домашние локации и телепортируйтесь с кулдауном", Order: 1},
	}
	for _, plugin := range plugins {
		if err := DB.Create(&plugin).Error; err != nil {
			return err
		}
	}

	commands := []models.Command{
		{PluginID: 1, Command: "/sethome", Description: "Set your home location", Usage: "/sethome [name]"},
		{PluginID: 1, Command: "/home", Description: "Teleport to your home", Usage: "/home [name]"},
	}
	for _, cmd := range commands {
		if err := DB.Create(&cmd).Error; err != nil {
			return err
		}
	}

	// ========================================
	// RULES
	// ========================================
	rules := []models.Rule{
		{Language: "en", Title: "🚫 Cheating and Exploits", Content: "<p>✗ Any cheats, hacks, or third-party software</p><p><strong>Penalty:</strong> Permanent ban</p>", Order: 1},
		{Language: "ru", Title: "🚫 Читы и эксплойты", Content: "<p>✗ Любые читы, хаки или стороннее ПО</p><p><strong>Наказание:</strong> Перманентный бан</p>", Order: 1},
	}
	for _, rule := range rules {
		if err := DB.Create(&rule).Error; err != nil {
			return err
		}
	}

	// ========================================
	// PAYMENT METHODS
	// ========================================
	paymentMethods := []models.PaymentMethod{
		{Name: "Visa", ImageURL: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=VISA", Order: 1, Enabled: true},
		{Name: "MasterCard", ImageURL: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=MC", Order: 2, Enabled: true},
		{Name: "PayPal", ImageURL: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=PayPal", Order: 3, Enabled: true},
	}
	for _, method := range paymentMethods {
		if err := DB.Create(&method).Error; err != nil {
			return err
		}
	}

	// ========================================
	// LEGAL DOCUMENTS
	// ========================================
	legalDocs := []models.LegalDocument{
		{Language: "en", Type: "terms", Title: "Terms of Service", Content: "<h3>1. Acceptance of Terms</h3><p>By accessing this server, you agree to these terms.</p>"},
		{Language: "ru", Type: "terms", Title: "Пользовательское соглашение", Content: "<h3>1. Принятие условий</h3><p>Используя сервер, вы соглашаетесь с условиями.</p>"},
	}
	for _, doc := range legalDocs {
		if err := DB.Create(&doc).Error; err != nil {
			return err
		}
	}

	// ========================================
	// CLANS - Rust Legacy format
	// ========================================
	clanCreated := time.Date(2026, 1, 30, 15, 0, 33, 0, time.UTC)
	clans := []models.Clan{
		{HexID: "0x38471ABB", Name: "WaR", Abbrev: "", LeaderSteamID: "76561197970954269", Created: clanCreated, Level: 10, Experience: 352736, MemberCount: 7, Tax: 30, Balance: 62661},
		{HexID: "0x38476E78", Name: "[GGWP]", Abbrev: "[GGWP]", LeaderSteamID: "76561197964659748", Created: time.Date(2026, 1, 30, 15, 1, 16, 0, time.UTC), Level: 6, Experience: 8352, MemberCount: 3, Tax: 10, Balance: 5263},
		{HexID: "0x38477121", Name: "PRASE", Abbrev: "PRASE", LeaderSteamID: "76561197967379561", Created: time.Date(2026, 1, 30, 15, 1, 17, 0, time.UTC), Level: 12, Experience: 271350, MemberCount: 3, Tax: 30, Balance: 35864},
	}
	for _, clan := range clans {
		if err := DB.Create(&clan).Error; err != nil {
			return err
		}
	}

	// Clan members
	clanMembers := []models.ClanMember{
		{ClanID: 1, SteamID: "76561197970954269", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197982325931", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197962419158", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197960596043", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197963954610", Permissions: "0"},
		{ClanID: 1, SteamID: "76561197960641812", Permissions: "0"},
		{ClanID: 1, SteamID: "76561197960397316", Permissions: "0"},
		{ClanID: 2, SteamID: "76561197964659748", Permissions: "invite,dismiss,management"},
		{ClanID: 2, SteamID: "76561197960538670", Permissions: "invite,dismiss,management"},
		{ClanID: 2, SteamID: "76561197961458770", Permissions: "0"},
		{ClanID: 3, SteamID: "76561197967379561", Permissions: "invite,dismiss,management"},
		{ClanID: 3, SteamID: "76561197961407422", Permissions: "management,expdetails"},
		{ClanID: 3, SteamID: "76561197970267653", Permissions: "0"},
	}
	for _, m := range clanMembers {
		DB.Create(&m)
	}

	// ========================================
	// PLAYERS - Rust Legacy format
	// ========================================
	clan1ID := uint(1)
	clan2ID := uint(2)
	clan3ID := uint(3)
	players := []models.Player{
		{SteamID: "76561197961407422", Username: "koolas", Rank: 60, Language: "RUS", KilledPlayers: 16, KilledMutants: 3, KilledAnimals: 15, Deaths: 60, PlayTime: 981, FirstConnectDate: time.Date(2026, 1, 30, 15, 0, 10, 0, time.UTC), LastConnectDate: time.Date(2026, 2, 1, 0, 52, 52, 0, time.UTC), ClanID: &clan3ID, IsOnline: false},
		{SteamID: "76561197970954269", Username: "WaR_Leader", Rank: 85, Language: "ENG", KilledPlayers: 142, KilledMutants: 28, KilledAnimals: 89, Deaths: 45, PlayTime: 2450, FirstConnectDate: time.Date(2026, 1, 28, 10, 0, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan1ID, IsOnline: true},
		{SteamID: "76561197982325931", Username: "RaiderPro", Rank: 72, Language: "RUS", KilledPlayers: 98, KilledMutants: 15, KilledAnimals: 56, Deaths: 67, PlayTime: 1890, FirstConnectDate: time.Date(2026, 1, 29, 12, 0, 0, 0, time.UTC), LastConnectDate: time.Now().Add(-1 * time.Hour), ClanID: &clan1ID, IsOnline: false},
		{SteamID: "76561197964659748", Username: "GGWP_Boss", Rank: 55, Language: "ENG", KilledPlayers: 45, KilledMutants: 8, KilledAnimals: 34, Deaths: 89, PlayTime: 1200, FirstConnectDate: time.Date(2026, 1, 30, 15, 5, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan2ID, IsOnline: true},
		{SteamID: "76561197967379561", Username: "PRASE_Chief", Rank: 78, Language: "RUS", KilledPlayers: 112, KilledMutants: 22, KilledAnimals: 78, Deaths: 52, PlayTime: 2100, FirstConnectDate: time.Date(2026, 1, 29, 8, 0, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan3ID, IsOnline: true},
		{SteamID: "76561197970267653", Username: "SoloHunter", Rank: 42, Language: "RUS", KilledPlayers: 28, KilledMutants: 5, KilledAnimals: 23, Deaths: 95, PlayTime: 650, FirstConnectDate: time.Date(2026, 1, 31, 9, 0, 0, 0, time.UTC), LastConnectDate: time.Now().Add(-30 * time.Minute), ClanID: &clan3ID, IsOnline: false},
	}
	for _, player := range players {
		if err := DB.Create(&player).Error; err != nil {
			return err
		}
	}

	// Player extended stats (from JSON)
	playerStats := []models.PlayerStats{
		{SteamID: "76561197961407422", RaidObjects: 0, TimeMinutes: 981, Wood: 28353, Metal: 2631, Sulfur: 2365, Leather: 8, Cloth: 88, Fat: 55, Suicides: 51},
		{SteamID: "76561197970954269", RaidObjects: 12, TimeMinutes: 2450, Wood: 125000, Metal: 45000, Sulfur: 28000, Leather: 45, Cloth: 120, Fat: 89, Suicides: 3},
		{SteamID: "76561197982325931", RaidObjects: 8, TimeMinutes: 1890, Wood: 89000, Metal: 32000, Sulfur: 19000, Leather: 32, Cloth: 95, Fat: 67, Suicides: 12},
		{SteamID: "76561197964659748", RaidObjects: 2, TimeMinutes: 1200, Wood: 45000, Metal: 15000, Sulfur: 8000, Leather: 18, Cloth: 55, Fat: 34, Suicides: 28},
		{SteamID: "76561197967379561", RaidObjects: 15, TimeMinutes: 2100, Wood: 150000, Metal: 52000, Sulfur: 35000, Leather: 52, Cloth: 140, Fat: 95, Suicides: 5},
		{SteamID: "76561197970267653", RaidObjects: 1, TimeMinutes: 650, Wood: 22000, Metal: 8000, Sulfur: 4500, Leather: 12, Cloth: 38, Fat: 22, Suicides: 19},
	}
	for _, s := range playerStats {
		DB.Create(&s)
	}

	// ========================================
	// ADMIN USER (password: admin123)
	// ========================================
	adminHash, _ := hashPassword("admin123")
	admin := models.AdminUser{Username: "admin", PasswordHash: adminHash}
	if err := DB.Create(&admin).Error; err != nil {
		log.Printf("Admin user may already exist: %v", err)
	}

	// ========================================
	// SHOP CATEGORIES
	// ========================================
	shopCategories := []models.ShopCategory{
		{Name: "VIP Packages", Language: "en", Order: 1, Enabled: true},
		{Name: "VIP Пакеты", Language: "ru", Order: 1, Enabled: true},
		{Name: "Resources", Language: "en", Order: 2, Enabled: true},
		{Name: "Ресурсы", Language: "ru", Order: 2, Enabled: true},
	}
	for _, cat := range shopCategories {
		if err := DB.Create(&cat).Error; err != nil {
			return err
		}
	}

	// ========================================
	// SHOP ITEMS
	// ========================================
	shopItems := []models.ShopItem{
		{CategoryID: 1, Language: "en", Name: "VIP Bronze", Description: "Basic VIP package with priority queue and custom chat color", Price: 9.99, Currency: "USD", ImageURL: "https://via.placeholder.com/400x300/0ea5e9/ffffff?text=VIP+Bronze", Enabled: true, Order: 1, Features: "[\"Priority queue\",\"Custom chat color\",\"1 home location\"]", Discount: 0},
		{CategoryID: 1, Language: "en", Name: "VIP Silver", Description: "Enhanced VIP package with 5 home locations and kit bonuses", Price: 19.99, Currency: "USD", ImageURL: "https://via.placeholder.com/400x300/06b6d4/ffffff?text=VIP+Silver", Enabled: true, Order: 2, Features: "[\"All Bronze benefits\",\"5 home locations\",\"Daily kit\",\"Teleport cooldown -50%\"]", Discount: 15},
		{CategoryID: 1, Language: "en", Name: "VIP Gold", Description: "Ultimate VIP - all perks plus clan boost and exclusive cosmetics", Price: 49.99, Currency: "USD", ImageURL: "https://via.placeholder.com/400x300/fbbf24/000000?text=VIP+Gold", Enabled: true, Order: 3, Features: "[\"All Silver benefits\",\"Unlimited homes\",\"Clan XP boost +25%\",\"Exclusive skin pack\",\"Support priority\"]", Discount: 25},
		{CategoryID: 2, Language: "en", Name: "Starter Resource Pack", Description: "Wood x5000, Stone x3000, Metal x1000", Price: 4.99, Currency: "USD", ImageURL: "https://via.placeholder.com/400x300/22c55e/ffffff?text=Resources", Enabled: true, Order: 1, Features: "[\"Instant delivery\",\"No cooldown\"]", Discount: 0},
		{CategoryID: 2, Language: "en", Name: "Mega Resource Pack", Description: "Wood x50000, Stone x30000, Metal x10000, Sulfur x5000", Price: 19.99, Currency: "USD", ImageURL: "https://via.placeholder.com/400x300/14b8a6/ffffff?text=Mega+Pack", Enabled: true, Order: 2, Features: "[\"Instant delivery\",\"Best value\",\"-20% vs individual\"]", Discount: 20},
	}
	for _, item := range shopItems {
		if err := DB.Create(&item).Error; err != nil {
			return err
		}
	}

	// ========================================
	// THEME
	// ========================================
	theme := models.Theme{
		Name:            "Blue Cyber",
		PrimaryColor:    "#0ea5e9",
		AccentColor:     "#06b6d4",
		BackgroundColor: "#030712",
		CardBackground:  "#0f172a",
		TextPrimary:     "#f8fafc",
		TextSecondary:   "#cbd5e1",
		BorderColor:     "rgba(14, 165, 233, 0.2)",
		GlowColor:       "rgba(14, 165, 233, 0.5)",
		IsActive:        true,
	}
	if err := DB.Create(&theme).Error; err != nil {
		return err
	}

	// ========================================
	// FONT SETTINGS
	// ========================================
	fonts := models.FontSettings{
		HeadingFont: "Orbitron",
		BodyFont:    "Exo 2",
		H1Size:      "clamp(3rem, 10vw, 7rem)",
		H2Size:      "clamp(2.5rem, 6vw, 4rem)",
		H3Size:      "1.5rem",
		BodySize:    "1rem",
	}
	if err := DB.Create(&fonts).Error; err != nil {
		return err
	}

	log.Println("Database seeded successfully")
	return nil
}

// SeedClansIfEmpty seeds clans+players when table is empty (for existing DBs)
func SeedClansIfEmpty() error {
	var clanCount int64
	DB.Model(&models.Clan{}).Count(&clanCount)
	if clanCount > 0 {
		return nil
	}
	log.Println("Seeding clans (table was empty)...")

	clanCreated := time.Date(2026, 1, 30, 15, 0, 33, 0, time.UTC)
	clans := []models.Clan{
		{HexID: "0x38471ABB", Name: "WaR", Abbrev: "", LeaderSteamID: "76561197970954269", Created: clanCreated, Level: 10, Experience: 352736, MemberCount: 7, Tax: 30, Balance: 62661},
		{HexID: "0x38476E78", Name: "[GGWP]", Abbrev: "[GGWP]", LeaderSteamID: "76561197964659748", Created: time.Date(2026, 1, 30, 15, 1, 16, 0, time.UTC), Level: 6, Experience: 8352, MemberCount: 3, Tax: 10, Balance: 5263},
		{HexID: "0x38477121", Name: "PRASE", Abbrev: "PRASE", LeaderSteamID: "76561197967379561", Created: time.Date(2026, 1, 30, 15, 1, 17, 0, time.UTC), Level: 12, Experience: 271350, MemberCount: 3, Tax: 30, Balance: 35864},
	}
	for _, clan := range clans {
		if err := DB.Create(&clan).Error; err != nil {
			return err
		}
	}

	clanMembers := []models.ClanMember{
		{ClanID: 1, SteamID: "76561197970954269", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197982325931", Permissions: "invite,dismiss,management"},
		{ClanID: 1, SteamID: "76561197962419158", Permissions: "invite,dismiss,management"},
		{ClanID: 2, SteamID: "76561197964659748", Permissions: "invite,dismiss,management"},
		{ClanID: 2, SteamID: "76561197960538670", Permissions: "invite,dismiss,management"},
		{ClanID: 3, SteamID: "76561197967379561", Permissions: "invite,dismiss,management"},
		{ClanID: 3, SteamID: "76561197961407422", Permissions: "management,expdetails"},
		{ClanID: 3, SteamID: "76561197970267653", Permissions: "0"},
	}
	for _, m := range clanMembers {
		DB.Create(&m)
	}

	clan1ID := uint(1)
	clan2ID := uint(2)
	clan3ID := uint(3)
	players := []models.Player{
		{SteamID: "76561197961407422", Username: "koolas", Rank: 60, Language: "RUS", KilledPlayers: 16, KilledMutants: 3, KilledAnimals: 15, Deaths: 60, PlayTime: 981, FirstConnectDate: time.Date(2026, 1, 30, 15, 0, 10, 0, time.UTC), LastConnectDate: time.Date(2026, 2, 1, 0, 52, 52, 0, time.UTC), ClanID: &clan3ID, IsOnline: false},
		{SteamID: "76561197970954269", Username: "WaR_Leader", Rank: 85, Language: "ENG", KilledPlayers: 142, KilledMutants: 28, KilledAnimals: 89, Deaths: 45, PlayTime: 2450, FirstConnectDate: time.Date(2026, 1, 28, 10, 0, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan1ID, IsOnline: true},
		{SteamID: "76561197982325931", Username: "RaiderPro", Rank: 72, Language: "RUS", KilledPlayers: 98, KilledMutants: 15, KilledAnimals: 56, Deaths: 67, PlayTime: 1890, FirstConnectDate: time.Date(2026, 1, 29, 12, 0, 0, 0, time.UTC), LastConnectDate: time.Now().Add(-1 * time.Hour), ClanID: &clan1ID, IsOnline: false},
		{SteamID: "76561197964659748", Username: "GGWP_Boss", Rank: 55, Language: "ENG", KilledPlayers: 45, KilledMutants: 8, KilledAnimals: 34, Deaths: 89, PlayTime: 1200, FirstConnectDate: time.Date(2026, 1, 30, 15, 5, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan2ID, IsOnline: true},
		{SteamID: "76561197967379561", Username: "PRASE_Chief", Rank: 78, Language: "RUS", KilledPlayers: 112, KilledMutants: 22, KilledAnimals: 78, Deaths: 52, PlayTime: 2100, FirstConnectDate: time.Date(2026, 1, 29, 8, 0, 0, 0, time.UTC), LastConnectDate: time.Now(), ClanID: &clan3ID, IsOnline: true},
	}
	for _, player := range players {
		DB.FirstOrCreate(&player, models.Player{SteamID: player.SteamID})
	}

	playerStats := []models.PlayerStats{
		{SteamID: "76561197961407422", RaidObjects: 0, TimeMinutes: 981, Wood: 28353, Metal: 2631, Sulfur: 2365, Leather: 8, Cloth: 88, Fat: 55, Suicides: 51},
		{SteamID: "76561197970954269", RaidObjects: 12, TimeMinutes: 2450, Wood: 125000, Metal: 45000, Sulfur: 28000, Leather: 45, Cloth: 120, Fat: 89, Suicides: 3},
		{SteamID: "76561197967379561", RaidObjects: 15, TimeMinutes: 2100, Wood: 150000, Metal: 52000, Sulfur: 35000, Leather: 52, Cloth: 140, Fat: 95, Suicides: 5},
	}
	for _, s := range playerStats {
		DB.Save(&s)
	}

	log.Println("Clans seeded successfully")
	return nil
}
