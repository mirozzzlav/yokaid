package reviews

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/reviews/create", false, http.MethodPost, create(server)},
	}
}
