package routes

import (
	"some-app/api/common"
	"some-app/api/routes/examples"
	filterItems "some-app/api/routes/filter_items"
	frontendData "some-app/api/routes/frontend_data"
	"some-app/api/routes/payments"
	"some-app/api/routes/professionals"
	"some-app/api/routes/professions"
	"some-app/api/routes/reviews"
	"some-app/api/routes/translations"
)

var routes []common.Route // private variable, not to use directly

func GetRoutes(server common.Server) []common.Route {
	routes = append(routes, examples.GetRoutes(server)...)
	routes = append(routes, professionals.GetRoutes(server)...)
	routes = append(routes, frontendData.GetRoutes(server)...)
	routes = append(routes, filterItems.GetRoutes(server)...)
	routes = append(routes, professions.GetRoutes(server)...)
	routes = append(routes, reviews.GetRoutes(server)...)
	routes = append(routes, translations.GetRoutes(server)...)
	routes = append(routes, payments.GetRoutes(server)...)
	return routes
}
