package examples

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/example/response", http.MethodGet, jsonResponse(server)),
		common.NewRoute("/example/email", http.MethodGet, submitEmail(server)),
		common.NewRoute("/example/panic", http.MethodGet, panicError(server)),
		common.NewRoute("/example/transaction/:username", http.MethodGet, transaction(server)),
		common.NewRoute("/example/second-transaction/:username", http.MethodGet, secondTransaction(server)),
	}
}
