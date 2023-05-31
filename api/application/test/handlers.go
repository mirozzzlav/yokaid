package test

import (
	"net/http"
	"rental-app/api/server"
)

var Handlers = func(router *server.Server) {

	test := NewTest()

	router.Handle("/test1", false, http.MethodGet, test.MyTestHandler1)
	router.Handle("/test2", false, http.MethodGet, test.MyTestHandler2)
	router.Handle("/test3", false, http.MethodGet, test.MyTestHandler3)
}
