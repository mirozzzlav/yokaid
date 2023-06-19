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
		var pros []common.Professional
		var err error
		filter, _ := ctx.Params.Get("filter")

		q, err := db.MergeStoreProcessorsQueries(db.FilterStoreQueryProcessor{Filter: filter})
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		err = server.GetStore().ListProfessionals(
			q,
			func(rowBytes []byte) {
				_ = json.Unmarshal(rowBytes, &pros)
			},
		)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		common.SetOKJSONResponse(ctx, pros)
	}
}
