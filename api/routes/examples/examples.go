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
		{"/example/transaction/:username", false, http.MethodGet, transaction(server)},
		{"/example/second-transaction/:username", false, http.MethodGet, secondTransaction(server)},
		{"/example/third-transaction/", false, http.MethodGet, thirdTransaction(server)},
		{"/example/validate/:id", false, http.MethodPut, validate(server)},
		{"/example/password/:password", false, http.MethodGet, password(server)},
	}
}
