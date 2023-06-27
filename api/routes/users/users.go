package users

import (
	"net/http"
	"rental-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/users/login", false, http.MethodPost, login(server)},
		{"/users/update/:id", true, http.MethodPut, update(server)},
		{"/users/activate/:password_change_token", false, http.MethodPut, activate(server)},
		{"/users/register", false, http.MethodPost, register(server)},
	}
}
