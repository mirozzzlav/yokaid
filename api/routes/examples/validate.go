package examples

import (
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func validate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req common.CreateReviewRequest

		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		idAny, idParamExist := ctx.Params.Get("id")
		if !idParamExist {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))
		}
		professionalId, err := common.ConvertToInt(idAny)
		common.CheckErrAndPanic(err)

		q := server.GetQueriesRepo().CreateReviewQuery(professionalId, req)

		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "Review successfully created.")
	}
}
