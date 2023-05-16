package server

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"rental-app/api/resources"
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
		Path:      "/books",
		IsPrivate: true,
		Method:    http.MethodGet,
		HandlerGetter: func(server interfaces.Server) gin.HandlerFunc {
			return func(ctx *gin.Context) {
				helpers.SetOKJSONResponse(ctx, resources.MockedBooks)
			}
		},
	},
}
