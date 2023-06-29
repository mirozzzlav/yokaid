package main

import (
	_ "github.com/lib/pq"
	"log"
	dbPkg "rental-app/api/db"
	"rental-app/api/mail"
	serverPkg "rental-app/api/server"
)

func main() {
	queryRunner := dbPkg.NewQueryRunner()
	queriesRepo := dbPkg.QueriesRepo{}
	storeHelpers := dbPkg.StoreHelpers{QueryRunner: queryRunner, QueriesRepo: queriesRepo}
	// creating new server instance
	server, err := serverPkg.NewServer(queryRunner, queriesRepo, storeHelpers, mail.Notifier{})
	if err != nil {
		log.Fatal("cannot create server:", err)
	}
	defer server.Close()

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
