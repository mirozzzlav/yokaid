package professionals

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common/helpers"
	"rental-app/api/common/interfaces"
	"rental-app/api/common/types"
)

func ListProfessionals(server interfaces.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer helpers.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := errors.New(fmt.Sprintf("Problem handling route: %s", err.Error()))
			helpers.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		var pros []types.Professional
		var err error
		if filter, filterExists := ctx.Params.Get("filter"); filterExists {
			helpers.CheckErrAndPanic(err, http.StatusInternalServerError)
			pros, err = server.GetStore().ListProfessionals(filter)
		} else {
			pros, err = server.GetStore().ListProfessionals("")
		}
		helpers.CheckErrAndPanic(err, http.StatusInternalServerError)
		helpers.SetOKJSONResponse(ctx, pros)
	}
}
