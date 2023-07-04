package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

func update(server common.Server) func(ctx *gin.Context) {
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

		err = server.GetQueryRunner().Update(q)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user successfully updated")
	}
}
