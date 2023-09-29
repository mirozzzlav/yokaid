package professionals

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/professionals/get", false, http.MethodGet, getProfessionals(server)},
		{"/professionals/get/:filter", false, http.MethodGet, getProfessionals(server)},
		{"/professionals/search/:searchName", false, http.MethodGet, searchProfessional(server)},
		{"/professionals/create-with-review", false, http.MethodPost, create(server)},
	}
}
