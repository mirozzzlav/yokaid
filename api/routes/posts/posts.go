package posts

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/posts/get", false, http.MethodGet, getPosts(server)},
		{"/posts/get/:filter", false, http.MethodGet, getPosts(server)},
		{"/posts/create", true, http.MethodPost, create(server)},
	}
}
