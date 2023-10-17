package professionals

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/professionals/get", http.MethodGet, getProfessionals(server)),
		common.NewRoute("/professionals/get/:filter", http.MethodGet, getProfessionals(server)),
		common.NewRoute("/professionals/get-detail/:professionalId", http.MethodGet, getProfessionalDetail(server)),
		common.NewRoute("/professionals/get-detail/:professionalId/:userPhone", http.MethodGet, getProfessionalDetail(server)),
		common.NewRoute("/professionals/search/:searchName", http.MethodGet, searchProfessional(server)),
		common.NewRoute("/professionals/create-with-review", http.MethodPost, create(server)),
	}
}
