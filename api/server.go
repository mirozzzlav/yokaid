package main

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/authorization"
	"rental-app/api/resources"
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

func (server *Server) setupRouter() {
	router := gin.Default()

	router.POST("/users/login", server.loginUser)

	server.setupAuthorizedRouter(router)

	router.NoRoute(
		func(ctx *gin.Context) {
			ctx.JSON(http.StatusNotFound, utils.ErrorResponse(errors.New("route not found")))
		},
	)
	server.router = router
}

func (server *Server) setupAuthorizedRouter(router *gin.Engine) {
	authRoutes := router.Group("/").Use(
		authorization.AuthMiddleware(server.tokenMaker, server.config.AccessTokenDuration),
	)

	authRoutes.GET("/books", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, utils.OkResponse(resources.MockedBooks))
	})

}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}
