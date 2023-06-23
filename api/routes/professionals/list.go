package professionals

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
	"rental-app/api/db"
)

func list(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pros, prosModelLoader := common.ProfessionalsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := db.GetFilterQueryPartial(filter)
		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().ListProfessionalsQuery(filterQP)
		err = server.GetQueryRunner().GetRows(dbQuery, prosModelLoader)

		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, pros)
	}
}
