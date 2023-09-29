package professionals

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func getProfessionals(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pros, prosModelLoader := common.ProfessionalsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := server.GetStoreHelpers(ctx).HandleFilter(filter)
		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetProfessionals(filterQP, true)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, pros)
	}
}

func searchProfessional(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		infos, infosModelLoader := common.ProfessionalsModelLoader()
		var err error
		searchName, _ := ctx.Params.Get("searchName")

		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetProfessionals(
			common.QueryPartial{
				Query:  "full_name ILIKE ?",
				Params: []any{"%" + searchName + "%"},
			}, true)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, infosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, infos)
	}
}
