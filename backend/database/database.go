package database

import (
	"fmt"
	"log"
	"os"

	"rust-legacy-site/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "postgres"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "rustlegacy"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "rustlegacy_password"
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

	// Создаем начальные данные
	serverInfo := models.ServerInfo{
		Name:        "Rust Legacy Server",
		MaxPlayers:  100,
		GameVersion: "Legacy",
		DownloadURL: "https://example.com/download/rust-legacy",
	}

	if err := DB.Create(&serverInfo).Error; err != nil {
		return err
	}

	// Описания
	descriptions := []models.Description{
		{
			ServerInfoID: serverInfo.ID,
			Language:     "en",
			Content:      "Welcome to our Rust Legacy server! Experience the classic survival gameplay with a friendly community. Build, survive, and dominate!",
		},
		{
			ServerInfoID: serverInfo.ID,
			Language:     "ru",
			Content:      "Добро пожаловать на наш Rust Legacy сервер! Испытайте классический геймплей выживания с дружным сообществом. Стройте, выживайте и доминируйте!",
		},
	}

	for _, desc := range descriptions {
		if err := DB.Create(&desc).Error; err != nil {
			return err
		}
	}

	// Фичи
	features := []models.Feature{
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Classic Rust Legacy experience", Icon: "zap", Order: 1},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Классический опыт Rust Legacy", Icon: "zap", Order: 1},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Active community and events", Icon: "users", Order: 2},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Активное сообщество и события", Icon: "users", Order: 2},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Regular updates and support", Icon: "globe", Order: 3},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Регулярные обновления и поддержка", Icon: "globe", Order: 3},
		{ServerInfoID: serverInfo.ID, Language: "en", Title: "Fair play and anti-cheat protection", Icon: "shield", Order: 4},
		{ServerInfoID: serverInfo.ID, Language: "ru", Title: "Честная игра и защита от читов", Icon: "shield", Order: 4},
	}

	for _, feature := range features {
		if err := DB.Create(&feature).Error; err != nil {
			return err
		}
	}

	// Примеры новостей
	news := []models.News{
		{
			Language:    "en",
			Title:       "Server Launch!",
			Content:     "We are excited to announce the launch of our Rust Legacy server. Join us today!",
			Published:   true,
			PublishedAt: models.News{}.CreatedAt,
		},
		{
			Language:    "ru",
			Title:       "Запуск сервера!",
			Content:     "Мы рады объявить о запуске нашего сервера Rust Legacy. Присоединяйтесь к нам сегодня!",
			Published:   true,
			PublishedAt: models.News{}.CreatedAt,
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
