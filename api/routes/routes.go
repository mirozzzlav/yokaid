package routes

import (
	"rental-app/api/common"
	"rental-app/api/routes/examples"
	"rental-app/api/routes/posts"
	"rental-app/api/routes/rentals"
	"rental-app/api/routes/users"
)

var routes []common.Route // private variable, not to use directly

func GetRoutes(server common.Server) []common.Route {
	routes = append(routes, examples.GetRoutes(server)...)
	routes = append(routes, users.GetRoutes(server)...)
	routes = append(routes, posts.GetRoutes(server)...)
	routes = append(routes, rentals.GetRoutes(server)...)
	return routes
}
