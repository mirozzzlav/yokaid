package server

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func panicMiddleware(s *server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			r := recover()
			if r == nil {
				return
			}

			if httpError, castingOk := r.(common.HttpError); castingOk {
				s.logError(ctx, httpError.Error)
				common.SetErrorJSONResponse(ctx, httpError.HttpCode, httpError.OutputError)
			}

		}()
		ctx.Next()
	}
}
