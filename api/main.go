package main

import (
	"context"
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"rental-app/api/application"
	"rental-app/api/common"
	"rental-app/api/db"
	"rental-app/api/server"
)

func main() {
	config, err := common.LoadConfig(".env")
	if err != nil {
		log.Fatal("cannot load config:", err)
	}

	conn, err := sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}

	ctx := context.Background()
	store := db.NewStore(conn, ctx)

	// creating new server instance
	serverPackage, err := server.NewServer(config, store)
	defer serverPackage.Close()
	if err != nil {
		log.Fatal("cannot create server:", err)
	}
	// getting all registered packages
	packages := application.PackageHandlers()
	for _, fn := range packages {
		fn.(func(server2 *server.Server))(serverPackage)
	}
	// initializing the router
	serverPackage.InitRouter()

	err = serverPackage.Start(config.Url)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
