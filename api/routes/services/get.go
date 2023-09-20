package services

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func getServices(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		services, servicesModelLoader := common.ServicesModelLoader()
		var err error
		searchTitle, _ := ctx.Params.Get("filter")

		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetServicesQuery(
			common.QueryPartial{
				Query:  "title ILIKE ?",
				Params: []any{"%" + searchTitle + "%"},
			})
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, servicesModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, services)
	}
}
