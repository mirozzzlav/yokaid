package professionals

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

func list(server common.Server) gin.HandlerFunc {
	internalErr := errors.New("error occurred while getting professionals list")
	return func(ctx *gin.Context) {
		var pros []common.ProfessionalResponse
		var err error
		if filter, filterExists := ctx.Params.Get("filter"); filterExists {
			pros, err = server.GetStore().ListProfessionalsForResponse(filter)
			common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		} else {
			pros, err = server.GetStore().ListProfessionalsForResponse("")
		}
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		common.SetOKJSONResponse(ctx, pros)
	}
}
