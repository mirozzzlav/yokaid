package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func panicMiddleware(s *server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			r := recover()
			if r == nil {
				return
			}

			if httpError, castingOk := r.(common.HttpError); castingOk {
				if httpError.Error != nil && httpError.ResponseMeta.Code == http.StatusInternalServerError {
					s.logError(ctx, httpError.Error)
				}
				common.SetErrorJSONResponse(
					ctx, httpError.ResponseMeta.Code,
					httpError.ResponseMeta.Msg,
					httpError.ResponseMeta.ExtraData,
				)
			} else {
				s.logError(ctx, errors.New(fmt.Sprintf("%s", r)))
			}
			s.GetQueryRunner(ctx).Rollback()

		}()
		ctx.Next()
	}
}
