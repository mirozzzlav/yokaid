package system

import (
	"net/http"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

func GetRoutes(server interfaces.Server) []types.Route {

	return []types.Route{
		types.NewRoute("/users/login", false, http.MethodPost, LoginUser(server)),
	}
}
