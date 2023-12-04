package professions

import (
	"github.com/gin-gonic/gin"
	"yokaid/api/common"
)

func getProfessions(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var err error
		searchTitle, _ := ctx.Params.Get("filter")

		common.CheckErrAndPanic(err)
		lang := common.GetLangFromSession(ctx)

		dbQuery := server.GetQueriesRepo().GetProfessionsQuery(
			common.QueryPartial{
				Query:  "unaccent(title->>?) ILIKE unaccent(?)",
				Params: []any{lang, "%" + searchTitle + "%"},
			}, lang)
		professions, professionsModelLoader := common.ProfessionsModelLoader()
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, professionsModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", professions)
	}
}
