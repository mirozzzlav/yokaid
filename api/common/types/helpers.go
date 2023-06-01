package types

import "github.com/gin-gonic/gin"

func NewRoute(path string, isPrivate bool, method string, handler gin.HandlerFunc) Route {
	return Route{
		Path:      path,
		IsPrivate: isPrivate,
		Method:    method,
		Handler:   handler,
	}
}
