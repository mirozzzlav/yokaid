package examples

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/example/response", false, http.MethodGet, jsonResponse(server)},
		{"/example/email", false, http.MethodGet, submitEmail(server)},
		{"/example/panic", false, http.MethodGet, panicError(server)},
		{"/example/query/:username", false, http.MethodGet, query(server)},
		{"/example/validate/:id", false, http.MethodPut, validate(server)},
		{"/example/password/:password", false, http.MethodGet, password(server)},
	}
}
