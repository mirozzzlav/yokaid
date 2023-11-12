package common

import (
	"errors"
	"github.com/joho/godotenv"
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
type config struct {
	AppName             string
	AppMailFrom         string
	AppMailAPIKey       string
	EnableNotifications bool
	DBDriver            string
	DBSource            string
	TokenSymmetricKey   string
	Url                 string
	AssetsFolder        string
	AssetsRelativeUrl   string
	Logs                logsConfig
	PublicRoles         []string
	InputFormats        map[string]string
	SMSPaymentPhone     string
	Translations        translationsConfig
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

var Config, _ = func() (config, error) {
	sysParams := GetSystemArgs()
	if envFile, ok := sysParams["envfile"]; ok {
		err := godotenv.Load(envFile)
		if err != nil {
			return config{}, err
		}
	}

	enableNotifications, err := strconv.ParseBool(os.Getenv("ENABLE_NOTIFICATIONS"))
	if err != nil {
		return config{}, err
	}

	return config{
		AppName:             os.Getenv("APP_NAME"),
		AppMailFrom:         os.Getenv("MAIL_FROM"),
		AppMailAPIKey:       os.Getenv("MAIL_API_KEY"),
		EnableNotifications: enableNotifications,
		DBDriver:            os.Getenv("DB_DRIVER"),
		DBSource:            os.Getenv("DB_URL"),
		TokenSymmetricKey:   os.Getenv("TOKEN_SYMMETRIC_KEY"),
		Url:                 os.Getenv("API_URL"),
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
	}, nil
}()
