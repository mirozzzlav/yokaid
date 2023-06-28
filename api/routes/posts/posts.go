package posts

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/posts/list", true, http.MethodGet, list(server)},
		{"/posts/list/:filter", true, http.MethodGet, list(server)},
	}
}
