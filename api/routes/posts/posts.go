package posts

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/posts/list", false, http.MethodGet, list(server)},
		{"/posts/list/:filter", false, http.MethodGet, list(server)},
		{"/posts/create", true, http.MethodPost, create(server)},
	}
}
