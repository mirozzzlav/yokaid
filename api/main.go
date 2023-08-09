package main

import (
	_ "github.com/lib/pq"
	"log"
	dbPkg "rental-app/api/db"
	"rental-app/api/mail"
	serverPkg "rental-app/api/server"
)

func main() {
	// creating new server instanc
	server, err := serverPkg.NewServer(
		dbPkg.QueriesRepo,
		dbPkg.NewQueryRunner,
		dbPkg.NewStoreHelpers,
		mail.Notifier{})
	if err != nil {
		log.Fatal("cannot create server:", err)
	}
	defer server.Close()

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
