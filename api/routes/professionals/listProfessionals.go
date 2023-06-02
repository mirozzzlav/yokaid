package professionals

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

func ListProfessionals(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer common.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := errors.New(fmt.Sprintf("Problem handling route: %s", err.Error()))
			common.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		var pros []common.Professional
		var err error
		if filter, filterExists := ctx.Params.Get("filter"); filterExists {
			common.CheckErrAndPanic(err, http.StatusInternalServerError)
			pros, err = server.GetStore().ListProfessionals(filter)
		} else {
			pros, err = server.GetStore().ListProfessionals("")
		}
		common.CheckErrAndPanic(err, http.StatusInternalServerError)
		common.SetOKJSONResponse(ctx, pros)
	}
}
