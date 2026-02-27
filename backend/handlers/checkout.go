package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	authpkg "rust-legacy-site/pkg/auth"
	"rust-legacy-site/pkg/paygate"
	"rust-legacy-site/pkg/rcon"
)

func CreateCheckout(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ItemID         uint   `json:"itemId"`
		SteamID        string `json:"steamId"`
		PaymentMethod  string `json:"paymentMethod"` // "balance" | "paygate"
		Email          string `json:"email"`         // optional, for PayGate
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	if req.SteamID == "" {
		http.Error(w, `{"error":"steamId required"}`, http.StatusBadRequest)
		return
	}

	var item models.ShopItem
	if err := database.DB.First(&item, req.ItemID).Error; err != nil {
		http.Error(w, `{"error":"item not found"}`, http.StatusNotFound)
		return
	}
	if !item.Enabled {
		http.Error(w, `{"error":"item not available"}`, http.StatusBadRequest)
		return
	}

	price := item.Price
	if item.Discount > 0 {
		price = price * (1 - float64(item.Discount)/100)
	}
	if price <= 0 {
		http.Error(w, `{"error":"invalid price"}`, http.StatusBadRequest)
		return
	}

	pm := req.PaymentMethod
	if pm == "" {
		pm = "paygate"
	}

	// Оплата балансом — нужна авторизация
	if pm == "balance" {
		claims := getClaims(r)
		if claims == nil || claims.Role != "user" {
			http.Error(w, `{"error":"login required for balance payment"}`, http.StatusUnauthorized)
			return
		}
		var user models.User
		if database.DB.First(&user, claims.UserID).Error != nil {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		if user.Balance < price {
			http.Error(w, `{"error":"insufficient balance"}`, http.StatusPaymentRequired)
			return
		}
		if item.RconCommand == "" {
			http.Error(w, `{"error":"item has no delivery command"}`, http.StatusBadRequest)
			return
		}

		// Списываем баланс и доставляем
		before := user.Balance
		user.Balance -= price
		if err := database.DB.Save(&user).Error; err != nil {
			http.Error(w, `{"error":"payment failed"}`, http.StatusInternalServerError)
			return
		}

		order := models.Order{
			UserID:        &user.ID,
			OrderType:     "shop",
			Status:        "delivered",
			ItemID:        &item.ID,
			SteamID:       req.SteamID,
			Amount:        price,
			Currency:      item.Currency,
			PaymentMethod: "balance",
			RconCommand:   item.RconCommand,
		}
		database.DB.Create(&order)

		// RCON доставка
		host := os.Getenv("RCON_HOST")
		port := 28016
		if p := os.Getenv("RCON_PORT"); p != "" {
			if v, err := strconv.Atoi(p); err == nil {
				port = v
			}
		}
		password := os.Getenv("RCON_PASSWORD")
		if host != "" && password != "" {
			if _, err := rcon.Execute(host, port, password, item.RconCommand, req.SteamID); err != nil {
				log.Printf("[Checkout] RCON delivery failed: %v", err)
			} else {
				order.RconExecuted = true
				database.DB.Save(&order)
			}
		}

		// Transaction
		database.DB.Create(&models.Transaction{
			UserID:        user.ID,
			Type:          "purchase",
			OrderID:       &order.ID,
			Amount:        -price,
			BalanceBefore: before,
			BalanceAfter:  user.Balance,
			Description:   "Purchase: " + item.Name,
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"ok": true,
			"orderId": order.ID,
			"message": "Purchase successful",
		})
		return
	}

	// PayGate
	siteURL := os.Getenv("SITE_URL")
	if siteURL == "" {
		siteURL = "https://rustlegacy.online"
	}

	order := models.Order{
		UserID:        nil,
		OrderType:     "shop",
		Status:        "pending",
		ItemID:        &item.ID,
		SteamID:       req.SteamID,
		Amount:        price,
		Currency:      item.Currency,
		PaymentMethod: "paygate",
		RconCommand:   item.RconCommand,
	}
	if claims := getClaims(r); claims != nil && claims.Role == "user" {
		order.UserID = &claims.UserID
	}
	if err := database.DB.Create(&order).Error; err != nil {
		http.Error(w, `{"error":"order failed"}`, http.StatusInternalServerError)
		return
	}

	callbackURL := siteURL + "/api/webhooks/paygate?order_id=" + strconv.Itoa(int(order.ID))
	inv, err := paygate.CreateInvoice(paygate.CreateInvoiceParams{
		Amount:      price,
		Currency:    item.Currency,
		CallbackURL: callbackURL,
		SuccessURL:  siteURL + "/shop?success=1&order=" + strconv.Itoa(int(order.ID)),
		CancelURL:   siteURL + "/shop",
		OrderID:     strconv.Itoa(int(order.ID)),
		Description: "Rust Legacy: " + item.Name,
		Email:       req.Email,
	})
	if err != nil {
		log.Printf("[Checkout] PayGate error: %v", err)
		order.Status = "failed"
		database.DB.Save(&order)
		errMsg := err.Error()
		if errMsg == "" || errMsg == "failed to create PayGate invoice" {
			errMsg = "payment gateway unavailable"
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"error": errMsg})
		return
	}

	order.PaygateInvoiceID = inv.InvoiceID
	order.PaygatePaymentURL = inv.PaymentURL
	database.DB.Save(&order)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":         true,
		"orderId":    order.ID,
		"paymentUrl": inv.PaymentURL,
	})
}

func getClaims(r *http.Request) *authpkg.Claims {
	claims := r.Context().Value("claims")
	if c, ok := claims.(*authpkg.Claims); ok {
		return c
	}
	return nil
}
