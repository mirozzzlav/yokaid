package server

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
)

type HandlerGetter func(server interfaces.Server) gin.HandlerFunc

type Route struct {
	Path          string
	IsPrivate     bool
	Method        string
	HandlerGetter HandlerGetter
}

var Routes = []Route{
	{
		Path:      "/users/login",
		IsPrivate: false,
		Method:    http.MethodPost,
		HandlerGetter: func(server interfaces.Server) gin.HandlerFunc {
			return func(ctx *gin.Context) {
				auth.LoginUser(ctx, server)
			}
		},
	},
	{
		Path:      "/professionals",
		IsPrivate: true,
		Method:    http.MethodGet,
		HandlerGetter: func(server interfaces.Server) gin.HandlerFunc {
			return func(ctx *gin.Context) {
				pros, _ := server.GetStore().ListProfessionals()
				helpers.SetOKJSONResponse(ctx, pros)
			}
		},
	},
}
