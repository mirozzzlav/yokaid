package main

import (
	_ "github.com/lib/pq"
	"log"
	dbPkg "some-app/api/db"
	"some-app/api/mail"
	serverPkg "some-app/api/server"
)

func main() {
	server, err := serverPkg.NewServer(
		dbPkg.QueriesRepo,
		dbPkg.NewQueryRunner,
		dbPkg.NewStoreHelpers,
		mail.Notifier{})
	if err != nil {
		log.Fatal("cannot create server:", err)
	}

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
