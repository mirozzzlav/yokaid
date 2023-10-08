package users

import (
	"net/http"
	"some-app/api/common"
)

var errMeta = map[string]common.ResponseMeta{
	"badRequest":        {Code: http.StatusBadRequest},
	"badRequestExpired": {Code: http.StatusBadRequest, Msg: "link has expired"},
}

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/users/login", http.MethodPost, login(server)),
		common.NewRoute("/users/update/:id", http.MethodPut, update(server), true),
		common.NewRoute("/users/activate/:activation_token", http.MethodPut, activate(server)),
		common.NewRoute("/users/register", http.MethodPost, register(server)),
		common.NewRoute(
			"/users/password-change-request",
			http.MethodPost,
			createRequestForPasswordChange(server),
		),
		common.NewRoute(
			"/users/password-change/:password_change_token",
			http.MethodPut,
			passwordChange(server),
		),
	}
}
