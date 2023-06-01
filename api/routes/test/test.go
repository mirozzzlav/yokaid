package test

import (
	"net/http"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

func GetRoutes(server interfaces.Server) []types.Route {

	return []types.Route{
		types.NewRoute("/test1", false, http.MethodGet, HandlerGetter1(server)),
		types.NewRoute("/test2", false, http.MethodGet, HandlerGetter2(server)),
	}
}
