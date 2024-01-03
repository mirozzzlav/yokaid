package examples

import (
	"net/http"
	"yokaid/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/example/response", http.MethodGet, jsonResponse(server)),
		common.NewRoute("/example/email", http.MethodGet, submitEmail(server)),
		common.NewRoute("/example/panic", http.MethodGet, panicError(server)),
	}
}
