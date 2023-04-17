package main

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	DBDriver            string
	DBSource            string
	TokenSymmetricKey   string
	AccessTokenDuration time.Duration
	Url                 string
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
	}, nil
}
