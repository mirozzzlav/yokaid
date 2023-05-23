package common

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"rental-app/api/common/types"
	"strconv"
	"time"
)

type Config struct {
	DBDriver            string
	DBSource            string
	TokenSymmetricKey   string
	AccessTokenDuration time.Duration
	Url                 string
	Policy              types.AuthPolicyConfig
}

func LoadConfig(envFilePath string) (config Config, err error) {

	error := godotenv.Load(envFilePath)
	if error != nil {
		log.Fatalf("cannot find or parse config file: %s", envFilePath)
	}

	accessTokenDuration, _ := strconv.Atoi(os.Getenv("ACCESS_TOKEN_DURATION"))

	return Config{
		DBDriver:            os.Getenv("DB_DRIVER"),
		DBSource:            os.Getenv("DB_URL"),
		TokenSymmetricKey:   os.Getenv("TOKEN_SYMETRIC_KEY"),
		AccessTokenDuration: time.Minute * time.Duration(accessTokenDuration),
		Url:                 os.Getenv("API_URL"),
		Policy: types.AuthPolicyConfig{
			Model: `
				[request_definition]
				r = sub, group, act, resource
				
				[policy_definition]
				p = sub, act, resource
				
				[policy_effect]
				e = some(where (p.eft == allow))
				
				[matchers]
				m = r.group == 'admin' || ((r.group == p.sub || r.sub == p.sub) && r.act == p.act && r.resource == p.resource)
			`,
		},
	}, nil
}
