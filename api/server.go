package main

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/authorization"
	"rental-app/api/utils"
	// "github.com/gin-gonic/gin/binding"
	//"github.com/go-playground/validator/v10"
	db "rental-app/api/db"
)

// Server serves HTTP requests for our banking service.
type Server struct {
	config     Config
	store      db.Store
	tokenMaker authorization.Maker
	router     *gin.Engine
}

// NewServer creates a new HTTP server and set up routing.
func NewServer(config Config, store db.Store) (*Server, error) {
	tokenMaker, err := authorization.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token maker: %w", err)
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	server.setupRouter()
	return server, nil
}

func (server *Server) initRoutes(group gin.IRoutes, routes []Route) {
	for _, route := range routes {
		group.Handle(route.method, route.path, route.handler)
	}
}

func (server *Server) setupRouter() {
	router := gin.Default()

	// public routes
	server.initRoutes(router, PrepareRoutes(server, false))

	// authorized routes
	authRoutesGroup := router.Group("/").Use(
		authorization.AuthMiddleware(server.tokenMaker, server.config.AccessTokenDuration),
	)
	server.initRoutes(authRoutesGroup, PrepareRoutes(server, true))

	// 404
	router.NoRoute(
		func(ctx *gin.Context) {
			ctx.JSON(http.StatusNotFound, utils.ErrorResponse(errors.New("route not found")))
		},
	)
	server.router = router
}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}
