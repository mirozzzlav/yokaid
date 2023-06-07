package examples

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/response/json", false, http.MethodGet, jsonResponse(server)},
		{"/email/submit", false, http.MethodGet, submitEmail(server)},
		{"/error/panic", false, http.MethodGet, panicError(server)},
	}
}
