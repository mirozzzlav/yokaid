package professionals

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/professionals/list", true, http.MethodGet, list(server)},
		{"/professionals/list/:filter", true, http.MethodGet, list(server)},
	}
}
