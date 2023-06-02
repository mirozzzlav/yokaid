package test

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func HandlerGetter2(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		common.SetOKJSONResponse(ctx, "Test Handler 2")
	}

}
