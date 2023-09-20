package services

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/services/get", false, http.MethodGet, getServices(server)},
		{"/services/get/:filter", false, http.MethodGet, getServices(server)},
	}
}
