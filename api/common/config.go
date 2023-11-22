package common

import (
	"errors"
	"flag"
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
type config struct {
	AppName             string
	AppMailFrom         string
	AppMailAPIKey       string
	EnableNotifications bool
	DBDriver            string
	DBSource            string
	AssetsFolder        string
	AssetsRelativeUrl   string
	Logs                logsConfig
	PublicRoles         []string
	InputFormats        map[string]string
	SMSPaymentPhone     string
	Translations        translationsConfig
	ReviewsPerPage      int
	DefaultLanguage     string
	Session             sessionConfig
	Port                string
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

var Config = func() config {

	var dbUrl string

	// Parse command-line flags
	flag.StringVar(&dbUrl, "db_url", "", "Database name")
	flag.Parse()

	if dbUrl == "" {
		panic(errors.New("missing argument db_url"))
	}

	enableNotifications, err := strconv.ParseBool(os.Getenv("ENABLE_NOTIFICATIONS"))
	if err != nil {
		panic(errors.New("missing ENABLE_NOTIFICATIONS parameter"))
	}

	return config{
		AppName:             os.Getenv("APP_NAME"),
		AppMailFrom:         os.Getenv("MAIL_FROM"),
		AppMailAPIKey:       os.Getenv("MAIL_API_KEY"),
		EnableNotifications: enableNotifications,
		DBDriver:            "postgres",
		DBSource:            dbUrl,
		AssetsFolder:        "./assets",
		AssetsRelativeUrl:   "/assets",
		Logs:                getLogsConfig(),
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
		Session:         sessionConfig{Name: "superstarSession", Secret: "SecretForSessionStore123"},
		Port:            os.Getenv("API_EXPOSED_PORT"),
	}
}()
