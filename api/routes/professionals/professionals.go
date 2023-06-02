package professionals

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/professionals", false, http.MethodGet, ListProfessionals(server)},
		{"/professionals/:filter", false, http.MethodGet, ListProfessionals(server)},
	}
}
