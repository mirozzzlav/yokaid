package examples

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func panicError(_ common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		panic("My new panic error...")
	}
}
