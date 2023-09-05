package server

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"regexp"
	"some-app/api/auth"
	"some-app/api/common"
	"some-app/api/routes"
)

type server struct {
	tokenMaker              common.Maker
	router                  *gin.Engine
	logError                func(ctx *gin.Context, err error)
	routes                  []common.Route
	authUser                *common.AuthUser
	queriesRepo             common.QueriesRepo
	validate                *validator.Validate
	notifier                common.Notifier
	queryRunnerInitializer  func(ctx *gin.Context, store any) common.QueryRunner
	storeHelpersInitializer func(runner common.QueryRunner, repo common.QueriesRepo) common.StoreHelpers
	db                      *sql.DB
}

func NewServer(
	repo common.QueriesRepo,
	queryRunnerInitializer func(ctx *gin.Context, store any) common.QueryRunner,
	storeHelpersInitializer func(runner common.QueryRunner, repo common.QueriesRepo) common.StoreHelpers,
	notifier common.Notifier,
) (common.Server, error) {

	tokenMaker, err := auth.NewPasetoMaker(common.Config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token maker: %w", err)
	}

	validate := validator.New()
	err = validate.RegisterValidation("publicRoles", common.PublicRolesValidator)
	if err != nil {
		return nil, err
	}
	err = validate.RegisterValidation("password", common.PasswordValidator)
	if err != nil {
		return nil, err
	}

	err = validate.RegisterValidation("string", common.StringValidator)
	if err != nil {
		return nil, err
	}

	err = validate.RegisterValidation("multiWords", common.MultiWordsValidator)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open(common.Config.DBDriver, common.Config.DBSource)
	if err != nil {
		return nil, err
	}

	server := &server{
		tokenMaker:              tokenMaker,
		queriesRepo:             repo,
		validate:                validate,
		notifier:                notifier,
		queryRunnerInitializer:  queryRunnerInitializer,
		storeHelpersInitializer: storeHelpersInitializer,
		db:                      db,
	}
	server.initRouter()
	err = server.initRequestLogger()
	if err != nil {
		return nil, err
	}

	return server, nil
}
func (s *server) GetQueryRunner(ctx *gin.Context) common.QueryRunner {
	return s.queryRunnerInitializer(ctx, s.db)
}

func (s *server) GetStoreHelpers(ctx *gin.Context) common.StoreHelpers {
	return s.storeHelpersInitializer(s.GetQueryRunner(ctx), s.queriesRepo)
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
		func(ctx *gin.Context) {
			// init repo + store helper
			qRunner := s.queryRunnerInitializer(ctx, s.db)
			s.storeHelpersInitializer(qRunner, s.queriesRepo)
			ctx.Next()
		},
	)
	router.Static(common.Config.AssetsRelativeUrl, common.Config.AssetsFolder)
	s.routes = routes.GetRoutes(s)
	for _, route := range s.routes {
		router.Handle(route.Method, route.Path, route.Handler)
	}

	// 404
	router.NoRoute(
		func(ctx *gin.Context) {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusNotFound}))
		},
	)

	s.router = router
}

func (s *server) Start() error {
	// server needs an url without http/https
	r := regexp.MustCompile("https?://")
	return s.router.Run(r.ReplaceAllString(common.Config.Url, ""))
}

func (s *server) GetQueriesRepo() common.QueriesRepo {
	return s.queriesRepo
}

func (s *server) GetTokenMaker() common.Maker {
	return s.tokenMaker
}

func (s *server) SetAuthUser(u common.AuthUser) {
	s.authUser = &u
}

func (s *server) GetAuthUser() *common.AuthUser {
	return s.authUser
}

func (s *server) IsPrivateRoute(path string) bool {
	for _, route := range s.routes {
		if route.Path == path && route.IsPrivate {
			return true
		}
	}
	return false
}

func (s *server) GetValidate() *validator.Validate {
	return s.validate
}

func (s *server) GetNotifier() common.Notifier {
	return s.notifier
}
