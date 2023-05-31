package professionals

import (
	"net/http"
	"rental-app/api/server"
)

var Handlers = func(router *server.Server) {
	professionals := NewProfessionals()

	router.Handle("/professionals", true, http.MethodGet, professionals.List)
}
