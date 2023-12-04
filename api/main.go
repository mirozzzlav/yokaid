package main

import (
	_ "github.com/lib/pq"
	"log"
	serverPkg "yokaid/api/server"
)

func main() {
	server, err := serverPkg.NewServer()
	if err != nil {
		log.Fatal("cannot create server:", err)
	}

	err = server.Start()
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
