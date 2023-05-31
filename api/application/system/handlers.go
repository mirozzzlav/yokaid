package system

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"rental-app/api/server"
)

var Handlers = func(router *server.Server) {

	router.Handle("/", false, http.MethodGet, func(ctx *gin.Context, server interfaces.Server) {
		helpers.SetOKJSONResponse(ctx, "Hello World")
	})

	router.Handle("/users/login", false, http.MethodPost, func(ctx *gin.Context, server interfaces.Server) {
		LoginUser(ctx, server)
	})
}
