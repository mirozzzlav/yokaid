package common

import (
	"github.com/gin-gonic/gin"
)

type Route struct {
	Path    string
	Method  string
	Handler gin.HandlerFunc
}

type HttpResponse struct {
	Code int
	Body HttpResponseBody
}

type HttpResponseBody struct {
	Msg  string `json:"msg"`
	Data any    `json:"data"`
}

type QueryPartial struct {
	Query  string
	Params []any
}
