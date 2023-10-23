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
	Msg  string
	Data any
}

type QueryPartial struct {
	Query  string
	Params []any
}
