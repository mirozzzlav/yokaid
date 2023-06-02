package routes

import (
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
	"rental-app/api/routes/professionals"
	"rental-app/api/routes/system"
	"rental-app/api/routes/test"
)

var routes []types.Route // private variable, not to use directly

func GetRoutes(server interfaces.Server) []types.Route {
	routes = append(routes, test.GetRoutes(server)...)
	routes = append(routes, system.GetRoutes(server)...)
	routes = append(routes, professionals.GetRoutes(server)...)
	return routes
}
