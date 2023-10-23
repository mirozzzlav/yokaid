package server

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"regexp"
	"some-app/api/common"
	"some-app/api/routes"
)

type server struct {
	router                  *gin.Engine
	logError                func(ctx *gin.Context, err error)
	routes                  []common.Route
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
	validate := validator.New()
	err := validate.RegisterValidation("publicRoles", common.PublicRolesValidator)
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

	err = validate.RegisterValidation("phone", common.PhoneNumberValidator)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open(common.Config.DBDriver, common.Config.DBSource)
	if err != nil {
		return nil, err
	}

	server := &server{
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
		panicMiddleware(s),
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

func (s *server) findInRoutes(matchFunc func(route common.Route) bool) bool {
	for _, route := range s.routes {

		if matchFunc(route) {
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
