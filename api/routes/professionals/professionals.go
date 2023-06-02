package professionals

import (
	"net/http"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

func GetRoutes(server interfaces.Server) []types.Route {

	return []types.Route{
		{"/professionals", false, http.MethodGet, ListProfessionals(server)},
	}
}
