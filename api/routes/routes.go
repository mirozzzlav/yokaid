package routes

import (
	"yokaid/api/common"
	"yokaid/api/routes/examples"
	frontendData "yokaid/api/routes/frontend_data"
	"yokaid/api/routes/payments"
	"yokaid/api/routes/professionals"
	"yokaid/api/routes/professions"
	"yokaid/api/routes/reviews"
	"yokaid/api/routes/translations"
)

var routes []common.Route // private variable, not to use directly

func GetRoutes(server common.Server) []common.Route {
	routes = append(routes, examples.GetRoutes(server)...)
	routes = append(routes, professionals.GetRoutes(server)...)
	routes = append(routes, frontendData.GetRoutes(server)...)
	routes = append(routes, professions.GetRoutes(server)...)
	routes = append(routes, reviews.GetRoutes(server)...)
	routes = append(routes, translations.GetRoutes(server)...)
	routes = append(routes, payments.GetRoutes(server)...)
	return routes
}
