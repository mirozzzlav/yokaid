package main

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"rental-app/api/common"
	dbPkg "rental-app/api/db"
	serverPkg "rental-app/api/server"
)

func main() {
	db, err := sql.Open(common.Config.DBDriver, common.Config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}

	queryRunner := dbPkg.NewQueryRunner(db)
	queriesRepo := dbPkg.QueriesRepo{}
	storeHelpers := dbPkg.StoreHelpers{QueryRunner: queryRunner, QueriesRepo: queriesRepo}
	// creating new server instance
	server, err := serverPkg.NewServer(queryRunner, queriesRepo, storeHelpers)
	if err != nil {
		log.Fatal("cannot create server:", err)
	}
	defer server.Close()

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
