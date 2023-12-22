package server

import (
	"context"
	"fmt"
	"github.com/gorilla/mux"
	"net"
	"net/http"
	"yokaid/media_store/common"
	"yokaid/media_store/routes"
)

func NewServer() error {

	router := mux.NewRouter()
	router.Use(PanicMiddleware)
	for _, route := range routes.Routes {
		router.HandleFunc(route.Pattern, route.Handler).Methods(route.Method)

	}

	server := &http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%s", common.Config.Port),
		Handler: router,
		BaseContext: func(listener net.Listener) context.Context {
			return context.Background()
		},
	}

	// Start the server
	fmt.Printf("Server listening on 0.0.0.0:%s", common.Config.Port)
	return server.ListenAndServe()
}
