package test

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
)

func HandlerGetter1(server interfaces.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		helpers.SetOKJSONResponse(ctx, "Test Handler 1")
	}

}
