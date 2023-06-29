package common

import (
	"errors"
	"github.com/joho/godotenv"
	"os"
	"strconv"
	"time"
)

type logsConfig struct {
	LogsToScreen bool
	LogsToFile   bool
}
type config struct {
	AppName             string
	AppMailFrom         string
	AppMailAPIKey       string
	EnableNotifications bool
	DBDriver            string
	DBSource            string
	TokenSymmetricKey   string
	AccessTokenDuration time.Duration
	Url                 string
	Policy              AuthPolicyConfig
	Logs                logsConfig
	PublicRoles         []string
}

var publicRoles = []string{"guest"}
var ErrNoRows = errors.New("no rows in result set")

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

var Config, _ = func(mode string) (config, error) {
	envFilePath := ".env." + mode
	err := godotenv.Load(envFilePath)
	if err != nil {
		return config{}, err
	}

	accessTokenDuration, _ := strconv.Atoi(os.Getenv("ACCESS_TOKEN_DURATION"))
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
		TokenSymmetricKey:   os.Getenv("TOKEN_SYMETRIC_KEY"),
		AccessTokenDuration: time.Minute * time.Duration(accessTokenDuration),
		Url:                 os.Getenv("API_URL"),
		Policy: AuthPolicyConfig{
			Model: `
				[request_definition]
				r = user, role, act, resource
				
				[policy_definition]
				p = user, role, act, resource
				
				[policy_effect]
				e = some(where (p.eft == allow))
				
				[matchers]
				m = r.role == 'admin' || ((r.role == p.role || r.user == p.user) && r.act == p.act && keyMatch(r.resource,p.resource))
			`,
		},
		Logs: getLogsConfig(),
	}, nil
}(GetEnvMode())
