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
)

func BalanceTopup(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims")
	if claims == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}
	c, ok := claims.(*authpkg.Claims)
	if !ok || (c.Role != "user" && c.UserID == 0) {
		http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
		return
	}

	var req struct {
		Amount   float64 `json:"amount"`
		Currency string  `json:"currency"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	if req.Amount < 1 {
		http.Error(w, `{"error":"amount must be at least 1"}`, http.StatusBadRequest)
		return
	}
	if req.Currency == "" {
		req.Currency = "USD"
	}

	siteURL := os.Getenv("SITE_URL")
	if siteURL == "" {
		siteURL = "https://rustlegacy.online"
	}

	order := models.Order{
		UserID:        &c.UserID,
		OrderType:     "topup",
		Status:        "pending",
		Amount:        req.Amount,
		Currency:      req.Currency,
		PaymentMethod: "paygate",
	}
	if err := database.DB.Create(&order).Error; err != nil {
		http.Error(w, `{"error":"order failed"}`, http.StatusInternalServerError)
		return
	}

	callbackURL := siteURL + "/api/webhooks/paygate?order_id=" + strconv.Itoa(int(order.ID))
	inv, err := paygate.CreateInvoice(paygate.CreateInvoiceParams{
		Amount:      req.Amount,
		Currency:    req.Currency,
		CallbackURL: callbackURL,
		SuccessURL:  siteURL + "/shop?topup=1&order=" + strconv.Itoa(int(order.ID)),
		CancelURL:   siteURL + "/shop",
		OrderID:     strconv.Itoa(int(order.ID)),
		Description: "Balance top-up",
	})
	if err != nil {
		log.Printf("[Balance] PayGate error: %v", err)
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
