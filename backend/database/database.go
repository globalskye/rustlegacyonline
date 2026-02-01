package database

import (
	"fmt"
	"log"
	"os"

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
		&models.DownloadLink{},
		&models.Theme{},
		&models.FontSettings{},
		&models.CompanyInfo{},
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
	// COMPANY INFO (обязательная информация об организации)
	// ========================================
	var companyCount int64
	DB.Model(&models.CompanyInfo{}).Count(&companyCount)
	if companyCount == 0 {
		companyInfo := models.CompanyInfo{
			LegalName:      "ИП / ООО [Укажите наименование]",
			Address:        "[Юридический или фактический адрес]",
			Phone:          "[Номер телефона]",
			INN:            "[ИНН]",
			OGRN:           "[ОГРН]",
			BankRequisites: "[Банковские реквизиты]",
			DeliveryInfo:   "Доставка цифровых товаров (игровые предметы, VIP) осуществляется мгновенно в игру после оплаты через RCON. Физические товары не доставляются.",
		}
		DB.Create(&companyInfo)
	}

	// ========================================
	// LEGAL DOCUMENTS
	// ========================================
	legalDocs := []models.LegalDocument{
		{Language: "en", Type: "terms", Title: "Terms of Service", Content: "<h3>1. Acceptance of Terms</h3><p>By accessing this server, you agree to these terms.</p>"},
		{Language: "ru", Type: "terms", Title: "Пользовательское соглашение", Content: "<h3>1. Принятие условий</h3><p>Используя сервер, вы соглашаетесь с условиями.</p>"},
		{Language: "en", Type: "company_info", Title: "Company Information", Content: "<p>See the Company page for full details.</p>"},
		{Language: "ru", Type: "company_info", Title: "Реквизиты организации", Content: "<p>Полная информация размещена на странице «Реквизиты».</p>"},
	}
	for _, doc := range legalDocs {
		if err := DB.Create(&doc).Error; err != nil {
			return err
		}
	}

	// Clans and players - no test data. Real data comes from TopSystem sync.

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

// SeedAdminIfEmpty creates default admin (admin/admin123) if no admin users exist
func SeedAdminIfEmpty() error {
	var count int64
	DB.Model(&models.AdminUser{}).Count(&count)
	if count > 0 {
		return nil
	}
	adminHash, err := hashPassword("admin123")
	if err != nil {
		return err
	}
	admin := models.AdminUser{Username: "admin", PasswordHash: adminHash}
	if err := DB.Create(&admin).Error; err != nil {
		return err
	}
	log.Println("[Database] Created default admin user (admin/admin123)")
	return nil
}

// SeedClansIfEmpty - no longer seeds test data. Clans/players come from TopSystem sync.
func SeedClansIfEmpty() error {
	return nil
}
