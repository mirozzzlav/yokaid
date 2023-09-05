package users

import (
	"net/http"
	"some-app/api/common"
)

var errMeta = map[string]common.ResponseMeta{
	"badRequest":        common.ResponseMeta{Code: http.StatusBadRequest},
	"badRequestExpired": common.ResponseMeta{Code: http.StatusBadRequest, Msg: "link has expired"},
}

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/users/login", false, http.MethodPost, login(server)},
		{"/users/update/:id", true, http.MethodPut, update(server)},
		{"/users/activate/:activation_token", false, http.MethodPut, activate(server)},
		{"/users/register", false, http.MethodPost, register(server)},
		{
			"/users/password-change-request",
			false,
			http.MethodPost,
			createRequestForPasswordChange(server),
		},
		{
			"/users/password-change/:password_change_token",
			false,
			http.MethodPut,
			passwordChange(server),
		},
	}
}
