package professionals

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

func list(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer common.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := errors.New(fmt.Sprintf("Problem handling route: %s", err.Error()))
			common.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		var pros []common.ProfessionalResponse
		var err error
		if filter, filterExists := ctx.Params.Get("filter"); filterExists {
			common.CheckErrAndPanic(err, http.StatusInternalServerError)
			pros, err = server.GetStore().ListProfessionalsForResponse(filter)
		} else {
			pros, err = server.GetStore().ListProfessionalsForResponse("")
		}
		common.CheckErrAndPanic(err, http.StatusInternalServerError)
		common.SetOKJSONResponse(ctx, pros)
	}
}
