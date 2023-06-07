package rentals

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/rentals/create", true, http.MethodPost, create(server)},
	}
}
