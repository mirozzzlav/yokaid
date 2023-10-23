package common

import (
	"github.com/gin-gonic/gin"
)

type Route struct {
	Path    string
	Method  string
	Handler gin.HandlerFunc
}

type HttpError struct {
	Error        error
	ResponseMeta ResponseMeta
}

type QueryPartial struct {
	Query  string
	Params []any
}

type ResponseMeta struct {
	Code      int
	Msg       string
	ExtraData any
}
