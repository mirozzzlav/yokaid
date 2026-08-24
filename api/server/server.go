package server

import (
	"database/sql"
	"fmt"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	appPkg "yokaid/api/app"
	"yokaid/api/common"
	dbPkg "yokaid/api/db"
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
func (s *server) GetQueryRunner(ctx *gin.Context) dbPkg.QueryRunner {
	return dbPkg.NewQueryRunner(ctx, s.db)
}

func (s *server) GetAppService(ctx *gin.Context) common.AppService {
	return appPkg.NewAppService(s.GetStore(ctx))
}

func (s *server) GetStore(ctx *gin.Context) common.Store {
	qRunner := s.GetQueryRunner(ctx)
	switch common.Config.StoreDriver {
	case "postgres":
		return dbPkg.NewStore(qRunner)
	default:
		panic(fmt.Errorf("unsupported store driver %s", common.Config.StoreDriver))
	}
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
			// init repo + app service
			appPkg.NewAppService(s.GetStore(ctx))
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
			panic(
				common.HttpResponse{
					Code: http.StatusNotFound,
					Body: common.HttpResponseBody{
						Msg: "Cannot find given route.",
					},
				})
		},
	)

	s.router = router
}

func (s *server) Start() error {
	// server needs an url without http/https
	return s.router.Run(fmt.Sprintf("0.0.0.0:%s", common.Config.Port))
}

func (s *server) GetValidate() *validator.Validate {
	return s.validate
}
