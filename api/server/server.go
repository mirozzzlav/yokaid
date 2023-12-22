package server

import (
	"database/sql"
	"fmt"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"yokaid/api/common"
	dbPkg "yokaid/api/db"
	"yokaid/api/mail"
	"yokaid/api/routes"
)

type server struct {
	router   *gin.Engine
	logError func(ctx *gin.Context, err error)
	validate *validator.Validate
	db       *sql.DB
}

func NewServer() (common.Server, error) {
	validate := validator.New()
	err := validate.RegisterValidation("password", common.PasswordValidator)
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

	err = validate.RegisterValidation("mediaFolderId", common.MediaFolderIdValidator)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open(common.Config.DBDriver, common.Config.DBSource)
	if err != nil {
		return nil, err
	}

	server := &server{
		validate: validate,
		db:       db,
	}
	server.initRouter()
	err = server.initRequestLogger()
	if err != nil {
		return nil, err
	}

	return server, nil
}
func (s *server) GetQueryRunner(ctx *gin.Context) common.QueryRunner {
	return dbPkg.NewQueryRunner(ctx, s.db)
}

func (s *server) GetStoreHelpers(ctx *gin.Context) common.StoreHelpers {
	return dbPkg.NewStoreHelpers(s.GetQueryRunner(ctx), s.GetQueriesRepo())
}

func (s *server) initRouter() {

	var router *gin.Engine
	if gin.Mode() != "release" {
		// running GIN in devel mode - enabling GIN logs on screen
		router = gin.Default()
	} else {
		router = gin.New()
	}

	cookieStore := cookie.NewStore([]byte(common.Config.Session.Secret))

	router.Use(
		panicMiddleware(s),
		func(ctx *gin.Context) {
			// init repo + store helper
			qRunner := dbPkg.NewQueryRunner(ctx, s.db)
			dbPkg.NewStoreHelpers(qRunner, dbPkg.QueriesRepo{})
			ctx.Next()
		},
		sessions.Sessions(common.Config.Session.Name, cookieStore),
	)
	router.Static(common.Config.AssetsRelativeUrl, common.Config.AssetsFolder)
	for _, route := range routes.GetRoutes(s) {
		router.Handle(route.Method, route.Path, route.Handler)
	}

	// 404
	router.NoRoute(
		func(ctx *gin.Context) {
			panic(common.HttpResponse{Code: http.StatusNotFound, Msg: "Cannot find given route."})
		},
	)

	s.router = router
}

func (s *server) Start() error {
	// server needs an url without http/https
	return s.router.Run(fmt.Sprintf("0.0.0.0:%s", common.Config.Port))
}

func (s *server) GetQueriesRepo() common.QueriesRepo {
	return dbPkg.QueriesRepo{}
}

func (s *server) GetValidate() *validator.Validate {
	return s.validate
}

func (s *server) GetNotifier() common.Notifier {
	return mail.Notifier{}
}
