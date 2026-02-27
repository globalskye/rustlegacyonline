package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"rust-legacy-site/database"
	"rust-legacy-site/models"
	"rust-legacy-site/pkg/rcon"
)

// PaygateWebhook — callback от PayGate.to при успешной оплате
// PayGate.to отправляет GET с query params: order_id (наш), value_coin, coin, txid_in, txid_out, address_in, value_forwarded_coin
func PaygateWebhook(w http.ResponseWriter, r *http.Request) {
	// PayGate.to использует GET; поддержка POST для обратной совместимости
	if r.Method == http.MethodGet {
		handlePaygateGET(w, r)
		return
	}
	if r.Method == http.MethodPost {
		handlePaygatePOST(w, r)
		return
	}
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

func handlePaygateGET(w http.ResponseWriter, r *http.Request) {
	orderIDStr := r.URL.Query().Get("order_id")
	if orderIDStr == "" {
		w.WriteHeader(http.StatusOK)
		return
	}

	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	valueCoin := r.URL.Query().Get("value_coin")
	coin := r.URL.Query().Get("coin")
	txidIn := r.URL.Query().Get("txid_in")
	txidOut := r.URL.Query().Get("txid_out")
	_ = r.URL.Query().Get("address_in")
	valueForwarded := r.URL.Query().Get("value_forwarded_coin")

	log.Printf("[Webhook] PayGate.to callback order_id=%d value_coin=%s coin=%s txid_out=%s", orderID, valueCoin, coin, txidOut)
	_ = txidIn
	_ = valueForwarded

	var order models.Order
	if database.DB.First(&order, orderID).Error != nil {
		log.Printf("[Webhook] Order %d not found", orderID)
		w.WriteHeader(http.StatusOK)
		return
	}
	if order.Status == "paid" || order.Status == "delivered" {
		w.WriteHeader(http.StatusOK)
		return
	}

	order.Status = "paid"
	database.DB.Save(&order)

	if order.OrderType == "topup" && order.UserID != nil {
		var user models.User
		if database.DB.First(&user, *order.UserID).Error == nil {
			before := user.Balance
			user.Balance += order.Amount
			database.DB.Save(&user)
			database.DB.Create(&models.Transaction{
				UserID:        user.ID,
				Type:          "topup",
				OrderID:       &order.ID,
				Amount:        order.Amount,
				BalanceBefore: before,
				BalanceAfter:  user.Balance,
				Description:   "Balance top-up",
			})
		}
	}

	if order.OrderType == "shop" && order.RconCommand != "" && order.SteamID != "" {
		host := os.Getenv("RCON_HOST")
		port := 28016
		if p := os.Getenv("RCON_PORT"); p != "" {
			if v, err := strconv.Atoi(p); err == nil {
				port = v
			}
		}
		password := os.Getenv("RCON_PASSWORD")
		if host != "" && password != "" {
			if _, err := rcon.Execute(host, port, password, order.RconCommand, order.SteamID); err != nil {
				log.Printf("[Webhook] RCON delivery failed: %v", err)
			} else {
				order.RconExecuted = true
				order.Status = "delivered"
				database.DB.Save(&order)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}

func handlePaygatePOST(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Status    string  `json:"status"`
		OrderID   string  `json:"order_id"`
		InvoiceID string  `json:"invoice_id"`
		Amount    float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	if payload.Status != "paid" && payload.Status != "completed" && payload.Status != "success" {
		w.WriteHeader(http.StatusOK)
		return
	}

	orderID, _ := strconv.Atoi(payload.OrderID)
	if orderID == 0 {
		w.WriteHeader(http.StatusOK)
		return
	}

	var order models.Order
	if database.DB.First(&order, orderID).Error != nil {
		w.WriteHeader(http.StatusOK)
		return
	}
	if order.Status == "paid" || order.Status == "delivered" {
		w.WriteHeader(http.StatusOK)
		return
	}

	order.Status = "paid"
	database.DB.Save(&order)

	if order.OrderType == "topup" && order.UserID != nil {
		var user models.User
		if database.DB.First(&user, *order.UserID).Error == nil {
			before := user.Balance
			user.Balance += order.Amount
			database.DB.Save(&user)
			database.DB.Create(&models.Transaction{
				UserID:        user.ID,
				Type:          "topup",
				OrderID:       &order.ID,
				Amount:        order.Amount,
				BalanceBefore: before,
				BalanceAfter:  user.Balance,
				Description:   "Balance top-up",
			})
		}
	}

	if order.OrderType == "shop" && order.RconCommand != "" && order.SteamID != "" {
		host := os.Getenv("RCON_HOST")
		port := 28016
		if p := os.Getenv("RCON_PORT"); p != "" {
			if v, err := strconv.Atoi(p); err == nil {
				port = v
			}
		}
		password := os.Getenv("RCON_PASSWORD")
		if host != "" && password != "" {
			if _, err := rcon.Execute(host, port, password, order.RconCommand, order.SteamID); err != nil {
				log.Printf("[Webhook] RCON delivery failed: %v", err)
			} else {
				order.RconExecuted = true
				order.Status = "delivered"
				database.DB.Save(&order)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}
