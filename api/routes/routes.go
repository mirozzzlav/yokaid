package routes

import (
	"rental-app/api/common"
	"rental-app/api/routes/professionals"
	"rental-app/api/routes/system"
	"rental-app/api/routes/test"
)

var routes []common.Route // private variable, not to use directly

func GetRoutes(server common.Server) []common.Route {
	routes = append(routes, test.GetRoutes(server)...)
	routes = append(routes, system.GetRoutes(server)...)
	routes = append(routes, professionals.GetRoutes(server)...)
	return routes
}
