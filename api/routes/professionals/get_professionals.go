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

		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(filterQP, -1, "")
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", pros)
	}
}

func searchProfessional(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		infos, infosModelLoader := common.ProfessionalsModelLoader()
		var err error
		searchName, _ := ctx.Params.Get("searchName")

		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{
				Query:  "full_name ILIKE ?",
				Params: []any{"%" + searchName + "%"},
			}, -1, "")
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, infosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", infos)
	}
}

func getProfessionalDetail(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var dbQuery common.Query
		pros, prosModelLoader := common.ProfessionalsModelLoader()

		professionalIdStr, paramExist := ctx.Params.Get("professionalId")
		if !paramExist {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		professionalId, err := common.ConvertToInt(professionalIdStr)
		if err != nil {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}

		userId, _ := ctx.Params.Get("userId")

		dbQuery = server.GetQueriesRepo().GetProfessionalContactQuery(professionalId, userId, "1")
		_, err = server.GetQueryRunner(ctx).GetScalar(dbQuery)
		if err == common.ErrNoRows {
			userId = ""
		} else {
			common.CheckErrAndPanic(err)
		}

		reviewsPage := 1
		if reviewsPageStr, ok := ctx.Params.Get("reviewsPage"); ok {
			reviewsPage, err = common.ConvertToInt(reviewsPageStr)
			if err != nil {
				panic(common.GetHttpResponseFromError(common.ErrBadInputs))
			}
		}
		dbQuery = server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{Query: "professionals.id = ?", Params: []any{professionalId}},
			reviewsPage,
			userId,
		)

		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		var professional any = nil
		if pros != nil && len(*pros) > 0 {
			professional = (*pros)[0]
		}
		common.SetOKJSONResponse(ctx, "", professional)

	}
}
