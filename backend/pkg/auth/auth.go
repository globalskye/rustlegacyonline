package auth

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtSecret = []byte(getJWTSecret())

func getJWTSecret() string {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		s = "rustlegacy-default-secret-change-in-production"
	}
	return s
}

type Claims struct {
	Username string `json:"username"` // login для user, username для admin
	AdminID  uint   `json:"adminId,omitempty"`
	UserID   uint   `json:"userId,omitempty"`
	Role     string `json:"role"` // "admin" | "user"
	jwt.RegisteredClaims
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateToken(username string, adminID uint) (string, error) {
	return GenerateAdminToken(username, adminID)
}

func GenerateAdminToken(username string, adminID uint) (string, error) {
	expiration := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: username,
		AdminID:  adminID,
		Role:     "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func GenerateUserToken(login string, userID uint) (string, error) {
	expiration := time.Now().Add(7 * 24 * time.Hour) // 7 дней для пользователей
	claims := &Claims{
		Username: login,
		UserID:   userID,
		Role:     "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

func AuthMiddleware(next http.Handler) http.Handler {
	return extractToken(next, func(claims *Claims) bool { return true })
}

func AdminMiddleware(next http.Handler) http.Handler {
	return extractToken(next, func(claims *Claims) bool {
		return claims.Role == "admin" || (claims.Role == "" && claims.AdminID > 0)
	})
}

func UserMiddleware(next http.Handler) http.Handler {
	return extractToken(next, func(claims *Claims) bool {
		return claims.Role == "user" || (claims.Role == "" && claims.UserID > 0)
	})
}

// OptionalAuthMiddleware добавляет claims в context если токен есть, не блокирует если нет
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				if claims, err := ValidateToken(parts[1]); err == nil {
					ctx := context.WithValue(r.Context(), "claims", claims)
					r = r.WithContext(ctx)
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}

func extractToken(next http.Handler, allow func(*Claims) bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
			return
		}
		claims, err := ValidateToken(parts[1])
		if err != nil {
			http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
			return
		}
		if !allow(claims) {
			http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
			return
		}
		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type AdminRepo interface {
	GetByUsername(username string) (*struct {
		ID           uint
		Username     string
		PasswordHash string
	}, error)
}

func Login(db *gorm.DB, username, password string) (string, string, error) {
	// 1. Сначала проверяем админов
	type adminRow struct {
		ID           uint
		Username     string
		PasswordHash string
	}
	var admin adminRow
	if err := db.Table("admin_users").Where("username = ?", username).First(&admin).Error; err == nil {
		if CheckPassword(password, admin.PasswordHash) {
			token, _ := GenerateAdminToken(admin.Username, admin.ID)
			return token, "admin", nil
		}
		return "", "", nil
	}

	// 2. Проверяем обычных пользователей
	type userRow struct {
		ID           uint
		Login        string
		PasswordHash string
	}
	var u userRow
	if err := db.Table("users").Where("login = ?", username).First(&u).Error; err != nil {
		return "", "", nil
	}
	if u.PasswordHash == "" {
		return "", "", nil // вход через Google, пароль не задан
	}
	if !CheckPassword(password, u.PasswordHash) {
		return "", "", nil
	}
	token, _ := GenerateUserToken(u.Login, u.ID)
	return token, "user", nil
}
