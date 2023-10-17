package professionals

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func getProfessionals(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pros, prosModelLoader := common.ProfessionalsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := server.GetStoreHelpers(ctx).HandleFilter(filter)
		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(filterQP, false, false)
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

		dbQuery := server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{
				Query:  "full_name ILIKE ?",
				Params: []any{"%" + searchName + "%"},
			}, true, false)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, infosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, infos)
	}
}

func getProfessionalDetail(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var dbQuery common.Query
		pros, prosModelLoader := common.ProfessionalsModelLoader()

		professionalIdStr, paramExist := ctx.Params.Get("professionalId")
		if !paramExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}
		professionalId, err := common.ConvertToInt(professionalIdStr)
		if err != nil {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}

		userPhone, paramExist := ctx.Params.Get("userPhone")
		requestContact := false

		if paramExist {
			dbQuery = server.GetQueriesRepo().CheckUserProfessionalContactQuery(professionalId, userPhone)
			_, err = server.GetQueryRunner(ctx).GetScalar(dbQuery)
			if err != common.ErrNoRows {
				common.CheckErrAndPanic(err)
				requestContact = true
			}
		}

		dbQuery = server.GetQueriesRepo().GetProfessionalsQuery(
			common.QueryPartial{Query: "professionals.id = ?", Params: []any{professionalId}},
			true, requestContact,
		)

		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, prosModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, pros)

	}
}
