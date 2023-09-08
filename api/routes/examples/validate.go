package examples

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func validate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req common.UpdateUserRequest

		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		id, idParamExist := ctx.Params.Get("id")
		if !idParamExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}
		q := server.GetQueriesRepo().UpdateUsersQuery(
			common.QueryPartial{
				Query:  "username = ?, full_name = ?, email = ?",
				Params: []any{req.Username, req.FullName, req.Email},
			},
			common.QueryPartial{
				Query:  "id = ?",
				Params: []any{id},
			},
		)

		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user successfully updated")
	}
}
