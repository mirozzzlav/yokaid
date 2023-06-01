package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
	"rental-app/api/routes"
)

type Server struct {
	config     common.Config
	Store      interfaces.Store
	TokenMaker interfaces.Maker
	router     *gin.Engine
	Routes     []types.Route
}

func NewServer(config common.Config, store interfaces.Store) (*Server, error) {
	tokenMaker, err := auth.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token maker: %w", err)
	}

	return &Server{
		config:     config,
		Store:      store,
		TokenMaker: tokenMaker,
	}, nil
}

func (server *Server) initHandlers(
	handle func(string, string, ...gin.HandlerFunc) gin.IRoutes,
	handlePrivate func(string, string, ...gin.HandlerFunc) gin.IRoutes,
) {
	routes := routes.GetRoutes(server)
	for _, route := range routes {
		if route.IsPrivate {
			handlePrivate(route.Method, route.Path, route.Handler)
			continue
		}
		handle(route.Method, route.Path, route.Handler)
	}
}

func (server *Server) InitRouter() {
	router := gin.Default()
	authRoutesGroup := router.Group("/")

	authRoutesGroup.Use(
		auth.TokenMiddleware(server),
		auth.PolicyMiddleware(server, server.config.Policy),
		TokenAppenderMiddleware(server),
	)
	server.initHandlers(router.Handle, authRoutesGroup.Handle)

	err := errors.New("route not found")
	// 404
	router.NoRoute(
		func(ctx *gin.Context) {
			helpers.SetErrorJSONResponse(ctx, http.StatusNotFound, err)
		},
	)

	server.router = router
}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func (server *Server) GetStore() interfaces.Store {
	return server.Store
}
func (server *Server) GetTokenMaker() interfaces.Maker {
	return server.TokenMaker
}

func (server *Server) GetConfig() common.Config {
	return server.config
}

func (server *Server) Close() {
	*server = Server{}
}
