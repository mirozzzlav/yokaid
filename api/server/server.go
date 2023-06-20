package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
	"rental-app/api/routes"
)

type server struct {
	config      common.Config
	tokenMaker  common.Maker
	router      *gin.Engine
	logError    func(ctx *gin.Context, err error)
	routes      []common.Route
	authUser    *common.AuthUser
	queryRunner common.QueryRunner
}

func NewServer(config common.Config, queryRunner common.QueryRunner) (common.Server, error) {
	tokenMaker, err := auth.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token maker: %w", err)
	}

	server := &server{
		config:      config,
		queryRunner: queryRunner,
		tokenMaker:  tokenMaker,
	}
	server.initRouter()
	err = server.initRequestLogger()
	if err != nil {
		return nil, err
	}
	return server, nil
}

func (s *server) initRouter() {

	var router *gin.Engine
	envMode := common.GetEnvMode()
	if envMode == "development" || envMode == "local" {
		// running GIN in devel mode - enabling GIN logs on screen
		router = gin.Default()
	} else {
		gin.SetMode(gin.ReleaseMode)
		router = gin.New()
	}

	router.Use(
		jsonbBufferWriterMiddleware(s), // this has to be first, as it turns on buffering on response for token appending
		panicMiddleware(s),
		auth.Middleware(s),
	)

	s.routes = routes.GetRoutes(s)
	for _, route := range s.routes {
		router.Handle(route.Method, route.Path, route.Handler)
	}

	// 404
	router.NoRoute(
		func(ctx *gin.Context) {
			panic(common.NewHttpError(errors.New("route not found"), http.StatusNotFound, nil))
		},
	)

	s.router = router
}

func (s *server) Start() error {
	return s.router.Run(s.config.Url)
}

func (s *server) GetQueryRunner() common.QueryRunner {
	return s.queryRunner
}
func (s *server) GetTokenMaker() common.Maker {
	return s.tokenMaker
}

func (s *server) GetConfig() common.Config {
	return s.config
}

func (s *server) SetAuthUser(u common.AuthUser) {
	s.authUser = &u
}

func (s *server) GetAuthUser() (common.AuthUser, error) {
	if s.authUser == nil {
		return common.AuthUser{}, errors.New("unauthenticated user")
	}
	return *s.authUser, nil
}

func (s *server) IsPrivateRoute(path string) bool {
	for _, route := range s.routes {
		if route.Path == path && route.IsPrivate {
			return true
		}
	}
	return false
}

func (s *server) Close() {
	*s = server{}
}
