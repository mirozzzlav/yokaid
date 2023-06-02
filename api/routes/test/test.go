package test

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/test1", false, http.MethodGet, HandlerGetter1(server)},
		{"/test2", false, http.MethodGet, HandlerGetter2(server)},
	}
}
