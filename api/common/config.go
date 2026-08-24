package common

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"strconv"
)

type logsConfig struct {
	LogsToScreen bool
	LogsToFile   bool
}

type translationsConfig struct {
	Root          string
	DefaultDomain string
}

type sessionConfig struct {
	Secret string
	Name   string
}

type sendServiceConfig struct {
	Url  string
	Auth string
}
type config struct {
	AppName           string
	AppMailFrom       string
	SupportMail       string
	DBDriver          string
	DBSource          string
	StoreDriver       string
	AssetsFolder      string
	AssetsRelativeUrl string
	Logs              logsConfig
	PublicRoles       []string
	InputFormats      map[string]string
	SMSPaymentPhone   string
	Translations      translationsConfig
	ReviewsPerPage    int
	DefaultLanguage   string
	Session           sessionConfig
	Port              string
	PayReview         string
	PayContact        string
	SendSMS           sendServiceConfig
	SendMail          sendServiceConfig
	MediaStoreUrl     string
}

var ErrNoRows = errors.New("no rows in result set")
var ErrRecordExist = errors.New("given record already exist")
var ErrBadInputs = errors.New("bad inputs provided")

type paymentStates struct {
	New  string
	Paid string
}

var PaymentStates = paymentStates{
	New:  "new",
	Paid: "paid",
}

func getLogsConfig() logsConfig {
	logsToScreen, err := strconv.ParseBool(os.Getenv("LOGS_TO_SCREEN"))
	if err != nil {
		logsToScreen = false
	}

	logsToFile, err := strconv.ParseBool(os.Getenv("LOGS_TO_FILE"))
	if err != nil {
		logsToFile = false
	}
	return logsConfig{LogsToScreen: logsToScreen, LogsToFile: logsToFile}
}

func getStoreDriver() string {
	storeDriver := os.Getenv("STORE_DRIVER")
	if storeDriver == "" {
		return "postgres"
	}
	return storeDriver
}

var Config = func() config {

	var dbUrl string
	var apiPort string
	var payReview string
	var payContact string
	var mediaStoreHost string
	var mediaStorePort string
	// Parse command-line flags
	flag.StringVar(&dbUrl, "db_url", "", "Database name")
	flag.StringVar(&apiPort, "api_port", "", "API port")
	flag.StringVar(&payReview, "pay_review", "", "Pay for reviews free, sms, or by verification")
	flag.StringVar(&payContact, "pay_contact", "", "Pay for contacts free, sms, or by verification")
	flag.StringVar(&mediaStoreHost, "media_store_host", "", "Media store host")
	flag.StringVar(&mediaStorePort, "media_store_port", "", "Media store port")
	flag.Parse()

	if dbUrl == "" {
		panic(errors.New("missing argument db_url"))
	}
	if mediaStoreHost == "" || mediaStorePort == "" {
		panic(errors.New("missing argument media_store_host or media_store_port"))
	}

	return config{
		AppName:           os.Getenv("APP_NAME"),
		AppMailFrom:       os.Getenv("MAIL_FROM"),
		SupportMail:       os.Getenv("SUPPORT_MAIL"),
		DBDriver:          "postgres",
		DBSource:          dbUrl,
		StoreDriver:       getStoreDriver(),
		AssetsFolder:      "./assets",
		AssetsRelativeUrl: "/assets",
		Logs:              getLogsConfig(),
		InputFormats: map[string]string{
			"phone": "+421 9xx xxx xxx",
		},
		SMSPaymentPhone: "2200",
		Translations: translationsConfig{
			Root:          "locale",
			DefaultDomain: "default",
		},
		ReviewsPerPage:  5,
		DefaultLanguage: "en_US",
		Session:         sessionConfig{Name: "yokaidSession", Secret: "SecretForSessionStore123"},
		Port:            apiPort,
		PayReview:       payReview,
		PayContact:      payContact,
		SendSMS: sendServiceConfig{
			Url:  os.Getenv("SEND_SMS_URL"),
			Auth: os.Getenv("SEND_SMS_AUTH"),
		},
		SendMail: sendServiceConfig{
			Url:  os.Getenv("SEND_MAIL_URL"),
			Auth: os.Getenv("SEND_MAIL_AUTH"),
		},
		MediaStoreUrl: fmt.Sprintf("%s:%s", mediaStoreHost, mediaStorePort),
	}
}()
