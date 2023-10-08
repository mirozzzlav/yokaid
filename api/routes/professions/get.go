package professions

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func getProfessions(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		professions, professionsModelLoader := common.ProfessionsModelLoader()
		var err error
		searchTitle, _ := ctx.Params.Get("filter")

		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetProfessionsQuery(
			common.QueryPartial{
				Query:  "title ILIKE ?",
				Params: []any{"%" + searchTitle + "%"},
			})
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, professionsModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, professions)
	}
}
