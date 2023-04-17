package main

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"rental-app/api/db"
)

func main() {
	config, err := LoadConfig(".env")
	if err != nil {
		log.Fatal("cannot load config:", err)
	}

	conn, err := sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}

	store := db.NewStore(conn)
	server, err := NewServer(config, store)
	if err != nil {
		log.Fatal("cannot create server:", err)
	}

	err = server.Start(config.Url)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
