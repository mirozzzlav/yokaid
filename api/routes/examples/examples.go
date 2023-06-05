package examples

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/jsonResponse", false, http.MethodGet, jsonResponse(server)},
		{"/submitEmail", false, http.MethodGet, submitEmail(server)},
	}
}
