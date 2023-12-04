package reviews

import (
	"net/http"
	"yokaid/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/reviews/create", http.MethodPost, create(server)),
	}
}
