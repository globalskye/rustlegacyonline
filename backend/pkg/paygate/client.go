package paygate

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
)

const (
	apiBase    = "https://api.paygate.to"
	checkoutBase = "https://checkout.paygate.to"
)

var (
	ErrNotConfigured = errors.New("PayGate not configured: set PAYGATE_MERCHANT_WALLET")
	ErrCreateInvoice = errors.New("failed to create PayGate invoice")
)

// CreateInvoiceParams — параметры для создания платёжной ссылки
type CreateInvoiceParams struct {
	Amount      float64
	Currency    string
	CallbackURL string
	SuccessURL  string
	CancelURL   string
	OrderID     string
	Description string
	Email       string
}

// CreateInvoiceResponse — ответ PayGate (address_in = payment URL, InvoiceID = ipn_token)
type CreateInvoiceResponse struct {
	PaymentURL string
	InvoiceID  string
}

// walletResponse — ответ GET wallet.php
type walletResponse struct {
	AddressIn        string `json:"address_in"`
	PolygonAddressIn string `json:"polygon_address_in"`
	CallbackURL      string `json:"callback_url"`
	IpnToken         string `json:"ipn_token"`
	Error            string `json:"error"`
	Status           string `json:"status"`
}

// CreateInvoice создаёт платёжную ссылку: Create Wallet → Build Payment URL (multi-provider pay.php)
func CreateInvoice(params CreateInvoiceParams) (*CreateInvoiceResponse, error) {
	merchantWallet := strings.TrimSpace(os.Getenv("PAYGATE_MERCHANT_WALLET"))
	if merchantWallet == "" {
		log.Printf("[PayGate] PAYGATE_MERCHANT_WALLET is empty")
		return nil, ErrNotConfigured
	}
	// EIP-55 checksum — PayGate может требовать корректный формат
	if addr := common.HexToAddress(merchantWallet); addr.Hex() != merchantWallet {
		merchantWallet = addr.Hex()
		log.Printf("[PayGate] Using EIP-55 checksum address")
	}
	log.Printf("[PayGate] Creating invoice: address=%s callback=%s", merchantWallet, params.CallbackURL)
	if params.CallbackURL == "" {
		return nil, fmt.Errorf("%w: callback URL required", ErrCreateInvoice)
	}
	if params.Currency == "" {
		params.Currency = "USD"
	}
	email := params.Email
	if email == "" {
		email = "payment@rustlegacy.online"
	}

	// Step 1: Create Wallet (GET wallet.php)
	callbackEncoded := url.QueryEscape(params.CallbackURL)
	walletURL := apiBase + "/control/wallet.php?address=" + url.QueryEscape(merchantWallet) + "&callback=" + callbackEncoded

	req, err := http.NewRequest("GET", walletURL, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrCreateInvoice, err)
	}
	req.Header.Set("User-Agent", "RustLegacy/1.0")
	req.Header.Set("Accept", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[PayGate] wallet.php request failed: %v", err)
		return nil, fmt.Errorf("%w: %v", ErrCreateInvoice, err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		log.Printf("[PayGate] wallet.php status %d: %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("%w: wallet status %d", ErrCreateInvoice, resp.StatusCode)
	}

	var wallet walletResponse
	if err := json.Unmarshal(body, &wallet); err != nil {
		log.Printf("[PayGate] wallet.php decode error: %v body=%s", err, string(body))
		return nil, fmt.Errorf("%w: decode wallet: %v", ErrCreateInvoice, err)
	}
	if wallet.Error != "" {
		log.Printf("[PayGate] wallet.php error: %s (address=%s)", wallet.Error, merchantWallet)
		return nil, fmt.Errorf("%w: %s", ErrCreateInvoice, wallet.Error)
	}
	if wallet.AddressIn == "" {
		log.Printf("[PayGate] wallet.php empty address_in: %s", string(body))
		return nil, ErrCreateInvoice
	}
	log.Printf("[PayGate] wallet created OK, building payment URL")

	// Step 2: Build multi-provider payment URL (pay.php)
	paymentURL := buildPayURL(wallet.AddressIn, params.Amount, params.Currency, email)
	if paymentURL == "" {
		return nil, ErrCreateInvoice
	}

	return &CreateInvoiceResponse{
		PaymentURL: paymentURL,
		InvoiceID:  wallet.IpnToken,
	}, nil
}

// buildPayURL формирует URL для pay.php (multi-provider mode)
// provider=hosted — показывает hosted страницу выбора платёжного провайдера
func buildPayURL(addressIn string, amount float64, currency, email string) string {
	u, err := url.Parse(checkoutBase + "/pay.php")
	if err != nil {
		return ""
	}
	q := u.Query()
	q.Set("address", addressIn)
	q.Set("amount", strconv.FormatFloat(amount, 'f', 2, 64))
	q.Set("currency", currency)
	q.Set("email", email)
	q.Set("provider", "hosted")
	u.RawQuery = q.Encode()
	return u.String()
}
