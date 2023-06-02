package test

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func HandlerGetter1(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		common.SetOKJSONResponse(ctx, "Test Handler 1")
	}

}
