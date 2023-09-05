package examples

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func jsonResponse(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		common.SetOKJSONResponse(ctx, "JSON response")
	}

}
