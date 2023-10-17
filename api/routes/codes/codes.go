package codes

import (
	"net/http"
	"some-app/api/common"
)

func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/codes/get/:paymentType/:entityId", http.MethodGet, getCode(server)),
		common.NewRoute("/codes/get/:paymentType/:entityId/:userPhone", http.MethodGet, getCode(server)),
	}
}
