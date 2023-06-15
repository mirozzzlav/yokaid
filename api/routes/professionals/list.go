package professionals

import (
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"rental-app/api/db"
)

func list(server common.Server) gin.HandlerFunc {
	internalErr := errors.New("error occurred while getting professionals list")
	return func(ctx *gin.Context) {
		var pros []common.ProfessionalResponse
		var err error
		var reqGetters []common.StoreRequestGetter
		if filter, filterExists := ctx.Params.Get("filter"); filterExists {
			common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
			reqGetters = []common.StoreRequestGetter{db.FilterStoreGetter{Filter: filter}}
		}

		err = server.GetStore().ListProfessionals(
			reqGetters,
			func(rowBytes []byte) {
				_ = json.Unmarshal(rowBytes, &pros)
			},
		)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		common.SetOKJSONResponse(ctx, pros)
	}
}
