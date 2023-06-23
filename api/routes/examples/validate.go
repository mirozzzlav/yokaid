package examples

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type updateUserRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

func validate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req updateUserRequest

		err := ctx.ShouldBindJSON(&req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		id, idParamExist := ctx.Params.Get("id")
		if !idParamExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}
		q := server.GetQueriesRepo().UpdateUserQuery(
			common.QueryPartial{
				Query:  "username = ?, fullname = ?, email = ?",
				Params: []any{req.Username, req.Fullname, req.Email},
			},
			common.QueryPartial{
				Query:  "id = ?",
				Params: []any{id},
			},
		)

		updatedUsers, err := server.GetQueryRunner().Update(q)
		common.CheckErrAndPanic(err)

		if updatedUsers == 0 {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}
		common.SetOKJSONResponse(ctx, "user successfully updated")
	}
}
