package professionals

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/professionals/list", false, http.MethodGet, list(server)},
		{"/professionals/list/:filter", false, http.MethodGet, list(server)},
	}
}
