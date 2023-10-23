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

		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(filterQP, false, "")
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
			}, false, "")
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

		userPhone, _ := ctx.Params.Get("userPhone")

		dbQuery = server.GetQueriesRepo().GetProfessionalContactQuery(professionalId, userPhone, "1")
		_, err = server.GetQueryRunner(ctx).GetScalar(dbQuery)
		if err == common.ErrNoRows {
			userPhone = ""
		} else {
			common.CheckErrAndPanic(err)
		}

		dbQuery = server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{Query: "professionals.id = ?", Params: []any{professionalId}},
			true,
			userPhone,
		)

		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "", pros)

	}
}
