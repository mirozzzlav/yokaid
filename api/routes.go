package main

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/authorization"
	"rental-app/api/resources"
	"rental-app/api/utils"
)

type Route struct {
	path      string
	isPrivate bool
	method    string
	handler   func(ctx *gin.Context)
}

func setTokenCreationError(error error, ctx *gin.Context) bool {
	if error == nil {
		return false
	}

	ctx.JSON(
		http.StatusInternalServerError,
		utils.ErrorResponse(errors.New("oooo, problem during new token creation")),
	)
	return true
}

func refreshTokenSetter(
	server *Server,
	isPrivateRoute bool,
	handler func(server *Server, ctx *gin.Context) utils.Response,
) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		routeResponse := handler(server, ctx)
		if routeResponse.Error != nil {
			ctx.JSON(routeResponse.HttpCode, utils.ErrorResponse(routeResponse.Error))
			return
		}

		if isPrivateRoute == false {
			ctx.JSON(routeResponse.HttpCode, utils.OkResponse(routeResponse.Data))
			return
		}

		token, error := authorization.GetRequestToken(ctx)
		if setTokenCreationError(error, ctx) {
			return
		}

		payload, error := server.tokenMaker.GetTokenPayload(token)
		if setTokenCreationError(error, ctx) {
			return
		}
		refreshToken, error := server.tokenMaker.CreateToken(payload.Username, server.config.AccessTokenDuration)
		if setTokenCreationError(error, ctx) {
			return
		}

		ctx.JSON(
			routeResponse.HttpCode,
			utils.OKResponse(routeResponse.Data, refreshToken),
		)

	}
}

func PrepareRoutes(server *Server, filterIsPrivate bool) []Route {
	type _Route struct {
		path      string
		isPrivate bool
		method    string
		handler   func(server *Server, ctx *gin.Context) utils.Response
	}

	_routes := []_Route{
		{
			path:      "/users/login",
			isPrivate: false,
			method:    http.MethodPost,
			handler:   LoginUser,
		},
		{
			path:      "/books",
			isPrivate: true,
			method:    http.MethodGet,
			handler: func(server *Server, ctx *gin.Context) utils.Response {
				return utils.Response{HttpCode: http.StatusOK, Data: resources.MockedBooks, Error: nil}
			},
		},
	}
	var routes []Route
	for _, route := range _routes {
		if route.isPrivate == filterIsPrivate {
			routes = append(
				routes,
				Route{
					path:      route.path,
					isPrivate: route.isPrivate,
					method:    route.method,
					handler:   refreshTokenSetter(server, route.isPrivate, route.handler),
				})
		}

	}
	return routes
}
