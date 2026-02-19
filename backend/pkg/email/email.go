package email

import (
	"bytes"
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// Config holds SMTP settings from env
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
	Enabled  bool
}

// LoadFromEnv reads SMTP config from environment
func LoadFromEnv() Config {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		from = user
	}
	return Config{
		Host:     host,
		Port:     port,
		User:     user,
		Password: pass,
		From:     from,
		Enabled:  host != "" && user != "" && pass != "",
	}
}

// Send sends a simple email via SMTP
func Send(cfg Config, to, subject, body string) error {
	if !cfg.Enabled {
		return fmt.Errorf("email not configured: set SMTP_HOST, SMTP_USER, SMTP_PASSWORD")
	}

	addr := cfg.Host + ":" + cfg.Port
	auth := smtp.PlainAuth("", cfg.User, cfg.Password, cfg.Host)

	msg := bytes.NewBuffer(nil)
	msg.WriteString("From: " + cfg.From + "\r\n")
	msg.WriteString("To: " + to + "\r\n")
	msg.WriteString("Subject: " + subject + "\r\n")
	msg.WriteString("Content-Type: text/plain; charset=UTF-8\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(body)

	return smtp.SendMail(addr, auth, cfg.From, []string{to}, msg.Bytes())
}

// SendContactForm sends contact form submission to recipient
func SendContactForm(cfg Config, to, name, fromEmail, message string) error {
	subject := fmt.Sprintf("[Rust Legacy] Сообщение от %s", name)
	body := fmt.Sprintf("Имя: %s\nEmail: %s\n\nСообщение:\n%s", name, fromEmail, message)
	return Send(cfg, to, subject, body)
}

// GetRecipient returns email recipient (company support or env override)
func GetRecipient(companyEmail string) string {
	if override := os.Getenv("CONTACT_EMAIL"); override != "" {
		return override
	}
	if companyEmail != "" {
		return strings.TrimSpace(companyEmail)
	}
	return ""
}
