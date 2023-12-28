package server

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
)

func panicMiddleware(s *server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			r := recover()
			if r == nil {
				return
			}

			if httpResponse, castingOk := r.(common.HttpResponse); castingOk {
				common.SetJSONResponse(
					ctx,
					httpResponse,
				)
			} else {
				s.logError(ctx, errors.New(fmt.Sprintf("%s", r)))
				common.SetJSONResponse(
					ctx,
					common.HttpResponse{
						Code: http.StatusInternalServerError,
						Body: common.HttpResponseBody{
							Msg: "Hoops, internal server error give it an other try.",
						},
					},
				)
			}
			s.GetQueryRunner(ctx).Rollback()

		}()
		ctx.Next()
	}
}
