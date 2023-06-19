package main

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"rental-app/api/common"
	"rental-app/api/db"
	serverPkg "rental-app/api/server"
)

func main() {
	config, err := common.LoadConfig(common.GetEnvMode())
	if err != nil {
		log.Fatal(err)
	}

	conn, err := sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}

	store := db.NewStore(conn)

	// creating new server instance
	server, err := serverPkg.NewServer(config, store)
	if err != nil {
		log.Fatal("cannot create server:", err)
	}
	defer server.Close()

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
