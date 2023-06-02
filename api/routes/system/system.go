package system

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/users/login", false, http.MethodPost, LoginUser(server)},
	}
}
