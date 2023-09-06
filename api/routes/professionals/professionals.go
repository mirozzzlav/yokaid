package professionals

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/professionals/get", false, http.MethodGet, getProfessionals(server)},
		{"/professionals/get/:filter", false, http.MethodGet, getProfessionals(server)},
		{"/professionals/create", true, http.MethodPost, create(server)},
		{"/professionals/get-info/:searchName", false, http.MethodGet, getProfessionalsInfo(server)},
	}
}
