package professionals

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"rental-app/api/db"
)

func list(server common.Server) gin.HandlerFunc {
	internalErr := errors.New("error occurred while getting professionals list")
	return func(ctx *gin.Context) {
		pros, prosModelLoader := common.ProfessionalsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := db.GetFilterQueryPartial(filter)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)

		dbQuery := server.GetQueriesRepo().ListProfessionalsQuery(filterQP)
		err = server.GetQueryRunner().GetRows(dbQuery, prosModelLoader)

		common.CheckErrAndPanic(err, http.StatusInternalServerError, internalErr)
		common.SetOKJSONResponse(ctx, pros)
	}
}
