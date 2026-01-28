package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"rust-legacy-site/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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
		password = "Alex43218228"
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
		&models.Player{},
		&models.Setting{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func Seed() error {
	// Проверяем, есть ли уже данные
	var count int64
	DB.Model(&models.ServerInfo{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded")
		return nil
	}

	// ========================================
	// SERVER INFO
	// ========================================
	serverInfo := models.ServerInfo{
		Name:          "RUST LEGACY X1",
		MaxPlayers:    100,
		GameVersion:   "Legacy",
		DownloadURL:   "https://example.com/download/rust-legacy-client.zip",
		VirusTotalURL: "https://www.virustotal.com/gui/file/YOUR_FILE_HASH",
	}
	if err := DB.Create(&serverInfo).Error; err != nil {
		return err
	}

	// Descriptions
	descriptions := []models.Description{
		{
			ServerInfoID: serverInfo.ID,
			Language:     "en",
			Content:      "Experience the classic Rust Legacy gameplay with balanced x1 rates. Build, survive, and dominate!",
		},
		{
			ServerInfoID: serverInfo.ID,
			Language:     "ru",
			Content:      "Испытайте классический геймплей Rust Legacy со сбалансированными рейтами x1. Стройте, выживайте и доминируйте!",
		},
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
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Classic x1 Rates", Description: "Pure vanilla experience with balanced gathering", Icon: "zap", Order: 1},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Классические x1 рейты", Description: "Чистый ванильный опыт со сбалансированным сбором", Icon: "zap", Order: 1},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Active Community", Description: "Join hundreds of players in our community", Icon: "users", Order: 2},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Активное сообщество", Description: "Присоединяйтесь к сотням игроков в нашем сообществе", Icon: "users", Order: 2},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "24/7 Uptime", Description: "Reliable server with 99.9% uptime", Icon: "server", Order: 3},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "24/7 Доступность", Description: "Надежный сервер с 99.9% аптаймом", Icon: "server", Order: 3},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Fair Play", Description: "Active admins ensuring fair gameplay", Icon: "shield", Order: 4},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Честная игра", Description: "Активные админы обеспечивают честный геймплей", Icon: "shield", Order: 4},
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
		{
			Language:   "en",
			StepNumber: 1,
			Title:      "Download the Client",
			Content:    "<p>Download our custom Rust Legacy client from the link above. The client is pre-configured and ready to connect.</p><ul><li>OS: Windows 7/8/10/11 (64-bit)</li><li>RAM: 4GB minimum</li><li>Storage: 5GB available space</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Download+Client",
		},
		{
			Language:   "ru",
			StepNumber: 1,
			Title:      "Скачайте клиент",
			Content:    "<p>Скачайте наш кастомный клиент Rust Legacy по ссылке выше. Клиент предварительно настроен и готов к подключению.</p><ul><li>ОС: Windows 7/8/10/11 (64-bit)</li><li>RAM: 4GB минимум</li><li>Хранилище: 5GB свободного места</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Download+Client",
		},
		{
			Language:   "en",
			StepNumber: 2,
			Title:      "Verify the Download",
			Content:    "<p>For your security, verify the downloaded file on VirusTotal. We provide transparency by offering the VirusTotal link.</p><p>Our client is completely safe - no malware, no viruses, just pure Rust Legacy gameplay.</p>",
			ImageURL:   "https://via.placeholder.com/600x400/06b6d4/ffffff?text=Verify+Download",
		},
		{
			Language:   "ru",
			StepNumber: 2,
			Title:      "Проверьте загрузку",
			Content:    "<p>Для вашей безопасности проверьте скачанный файл на VirusTotal. Мы предоставляем полную прозрачность.</p><p>Наш клиент полностью безопасен - никаких вирусов, только чистый Rust Legacy.</p>",
			ImageURL:   "https://via.placeholder.com/600x400/06b6d4/ffffff?text=Verify+Download",
		},
		{
			Language:   "en",
			StepNumber: 3,
			Title:      "Install and Launch",
			Content:    "<p>Extract the archive and run RustLegacy.exe. The client will automatically connect to our server.</p><p><strong>First Launch:</strong></p><ul><li>Create your character</li><li>Press F1 for console</li><li>Type /help for commands</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/14b8a6/ffffff?text=Install+Game",
		},
		{
			Language:   "ru",
			StepNumber: 3,
			Title:      "Установите и запустите",
			Content:    "<p>Извлеките архив и запустите RustLegacy.exe. Клиент автоматически подключится к нашему серверу.</p><p><strong>Первый запуск:</strong></p><ul><li>Создайте персонажа</li><li>Нажмите F1 для консоли</li><li>Введите /help для команд</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/14b8a6/ffffff?text=Install+Game",
		},
		{
			Language:   "en",
			StepNumber: 4,
			Title:      "Start Playing!",
			Content:    "<p>You're all set! Here are some tips:</p><ul><li>Use /kit starter for free starter kit</li><li>Use /sethome to save your location</li><li>Join our Discord for support</li><li>Read /rules command</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/0284c7/ffffff?text=Start+Playing",
		},
		{
			Language:   "ru",
			StepNumber: 4,
			Title:      "Начинайте играть!",
			Content:    "<p>Все готово! Несколько советов:</p><ul><li>Используйте /kit starter для стартового набора</li><li>Используйте /sethome чтобы сохранить локацию</li><li>Присоединяйтесь к Discord для поддержки</li><li>Прочтите /rules</li></ul>",
			ImageURL:   "https://via.placeholder.com/600x400/0284c7/ffffff?text=Start+Playing",
		},
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
		{
			Language: "en",
			Section:  "description",
			Title:    "Server Type",
			Content:  "<p>Classic Rust Legacy x1 vanilla server. No gameplay-affecting mods or plugins.</p>",
			Order:    1,
		},
		{
			Language: "ru",
			Section:  "description",
			Title:    "Тип сервера",
			Content:  "<p>Классический Rust Legacy x1 ванильный сервер. Без модов влияющих на геймплей.</p>",
			Order:    1,
		},
		{
			Language: "en",
			Section:  "description",
			Title:    "Wipe Schedule",
			Content:  "<p><strong>Map Wipes:</strong> Every 2 weeks (Thursdays 18:00 UTC)<br><strong>BP Wipes:</strong> Monthly</p>",
			Order:    2,
		},
		{
			Language: "ru",
			Section:  "description",
			Title:    "Расписание вайпов",
			Content:  "<p><strong>Вайпы карты:</strong> Каждые 2 недели (Четверг 18:00 UTC)<br><strong>Вайпы BP:</strong> Ежемесячно</p>",
			Order:    2,
		},
		{
			Language: "en",
			Section:  "description",
			Title:    "Server Location",
			Content:  "<p>Hosted in Europe (Germany) for optimal ping to CIS and EU players.</p>",
			VideoURL: "https://www.youtube.com/watch?v=example",
			Order:    3,
		},
		{
			Language: "ru",
			Section:  "description",
			Title:    "Расположение сервера",
			Content:  "<p>Хостинг в Европе (Германия) для оптимального пинга для игроков СНГ и ЕС.</p>",
			VideoURL: "https://www.youtube.com/watch?v=example",
			Order:    3,
		},
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

	// Commands for Teleport System
	commands := []models.Command{
		{PluginID: 1, Command: "/sethome", Description: "Set your home location", Usage: "/sethome [name]"},
		{PluginID: 1, Command: "/home", Description: "Teleport to your home (5min cooldown)", Usage: "/home [name]"},
		{PluginID: 1, Command: "/removehome", Description: "Remove a home location", Usage: "/removehome [name]"},
		{PluginID: 2, Command: "/sethome", Description: "Установить домашнюю локацию", Usage: "/sethome [название]"},
		{PluginID: 2, Command: "/home", Description: "Телепортироваться домой (5мин кулдаун)", Usage: "/home [название]"},
		{PluginID: 2, Command: "/removehome", Description: "Удалить домашнюю локацию", Usage: "/removehome [название]"},
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
		{
			Language: "en",
			Title:    "🚫 Cheating and Exploits",
			Content:  "<p>✗ Any cheats, hacks, or third-party software</p><p>✗ Exploiting game bugs or glitches</p><p>✗ Macro use or automation</p><p><strong>Penalty:</strong> Permanent ban</p>",
			Order:    1,
		},
		{
			Language: "ru",
			Title:    "🚫 Читы и эксплойты",
			Content:  "<p>✗ Любые читы, хаки или стороннее ПО</p><p>✗ Использование багов игры</p><p>✗ Использование макросов</p><p><strong>Наказание:</strong> Перманентный бан</p>",
			Order:    1,
		},
		{
			Language: "en",
			Title:    "💬 Behavior and Communication",
			Content:  "<p>✗ Harassment, racism, or hate speech</p><p>✗ Excessive toxicity or griefing</p><p>✗ Impersonating staff</p><p><strong>Penalty:</strong> Mute, kick, or ban</p>",
			Order:    2,
		},
		{
			Language: "ru",
			Title:    "💬 Поведение и общение",
			Content:  "<p>✗ Оскорбления, расизм или hate speech</p><p>✗ Чрезмерная токсичность</p><p>✗ Выдача себя за администрацию</p><p><strong>Наказание:</strong> Мут, кик или бан</p>",
			Order:    2,
		},
		{
			Language: "en",
			Title:    "⚔️ Raiding and PvP",
			Content:  "<p>✓ Raiding is allowed 24/7</p><p>✗ Griefing after successful raid</p><p>✗ Foundation wiping</p><p>✗ Killing freshspawns repeatedly</p><p><strong>Penalty:</strong> Warning or temporary ban</p>",
			Order:    3,
		},
		{
			Language: "ru",
			Title:    "⚔️ Рейды и PvP",
			Content:  "<p>✓ Рейды разрешены 24/7</p><p>✗ Гриф после успешного рейда</p><p>✗ Уничтожение фундамента</p><p>✗ Многократное убийство новичков</p><p><strong>Наказание:</strong> Предупреждение или временный бан</p>",
			Order:    3,
		},
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
		{Name: "Crypto", ImageURL: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=BTC", Order: 4, Enabled: true},
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
		{
			Language: "en",
			Type:     "terms",
			Title:    "Terms of Service",
			Content:  "<h3>1. Acceptance of Terms</h3><p>By accessing this server, you agree to these terms.</p><h3>2. User Conduct</h3><p>Respectful behavior is required.</p>",
		},
		{
			Language: "ru",
			Type:     "terms",
			Title:    "Пользовательское соглашение",
			Content:  "<h3>1. Принятие условий</h3><p>Используя сервер, вы соглашаетесь с условиями.</p><h3>2. Поведение пользователей</h3><p>Требуется уважительное поведение.</p>",
		},
		{
			Language: "en",
			Type:     "privacy",
			Title:    "Privacy Policy",
			Content:  "<h3>1. Information Collection</h3><p>We collect Steam ID, username, and gameplay data.</p>",
		},
		{
			Language: "ru",
			Type:     "privacy",
			Title:    "Политика конфиденциальности",
			Content:  "<h3>1. Сбор информации</h3><p>Мы собираем Steam ID, имя пользователя и данные игры.</p>",
		},
		{
			Language: "en",
			Type:     "company_info",
			Title:    "Company Information",
			Content:  "<h3>Legal Entity</h3><p><strong>Company Name:</strong> ООО \"Example Gaming\"</p><p><strong>УНП:</strong> 123456789</p>",
		},
		{
			Language: "ru",
			Type:     "company_info",
			Title:    "Информация о компании",
			Content:  "<h3>Юридическое лицо</h3><p><strong>Название компании:</strong> ООО \"Example Gaming\"</p><p><strong>УНП:</strong> 123456789</p>",
		},
	}
	for _, doc := range legalDocs {
		if err := DB.Create(&doc).Error; err != nil {
			return err
		}
	}

	// ========================================
	// NEWS
	// ========================================
	news := []models.News{
		{
			Language:    "en",
			Title:       "Server Launch!",
			Content:     "Welcome to our Rust Legacy server! Join us for classic survival gameplay.",
			ImageURL:    "https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Server+Launch",
			Published:   true,
			PublishedAt: time.Now(),
		},
		{
			Language:    "ru",
			Title:       "Запуск сервера!",
			Content:     "Добро пожаловать на наш Rust Legacy сервер! Присоединяйтесь к классическому выживанию.",
			ImageURL:    "https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Server+Launch",
			Published:   true,
			PublishedAt: time.Now(),
		},
	}
	for _, n := range news {
		if err := DB.Create(&n).Error; err != nil {
			return err
		}
	}

	log.Println("Database seeded successfully")
	return nil
}