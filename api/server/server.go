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
	"rental-app/api/store"
)

type HandlerGetter func(ctx *gin.Context, server interfaces.Server)

type Route struct {
	Path          string
	IsPrivate     bool
	Method        string
	HandlerGetter HandlerGetter
}

var Routes []Route

type Server struct {
	config     common.Config
	Store      store.IStore
	TokenMaker interfaces.Maker
	router     *gin.Engine
}

func NewServer(config common.Config, store store.IStore) (*Server, error) {
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

	for _, route := range Routes {
		// fn - since function in the golang represents a go routine, it is necessary to store the value of the added func in a new variable otherwise, it will not be transferred into func(ctx *gin.Context)
		fn := route.HandlerGetter
		if route.IsPrivate {
			handlePrivate(route.Method, route.Path, func(ctx *gin.Context) {
				fn(ctx, server)
			})
			continue
		}
		handle(route.Method, route.Path, func(ctx *gin.Context) {
			fn(ctx, server)
		})
	}
}

func (server *Server) Handle(Path string, IsPrivate bool, Method string, HandlerGetter HandlerGetter) {

	parameters := []Route{
		{
			Path:          Path,
			IsPrivate:     IsPrivate,
			Method:        Method,
			HandlerGetter: HandlerGetter,
		},
	}

	if Routes != nil {
		Routes = append(Routes, parameters...)
	} else {
		Routes = parameters
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

func (server *Server) GetStore() store.IStore {
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
