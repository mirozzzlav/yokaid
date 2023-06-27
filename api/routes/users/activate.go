package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
)

type UserActivationReq struct {
	Password string `json:"password" validate:"passwords"`
}

func activate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req UserActivationReq
		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		token, tokenParamExist := ctx.Params.Get("password_change_token")
		if !tokenParamExist {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))
		}

		q := server.GetQueriesRepo().GetPasswordChangeRequestsQuery(
			common.QueryPartial{
				Query:  "token = ? and now() - created_at < INTERVAL '24 hours'",
				Params: []any{token},
			},
		)

		requestsRef, reqModelLoader := common.PasswordChangeRequestsModelLoader()
		err = server.GetQueryRunner().GetRows(q, reqModelLoader)
		common.CheckErrAndPanic(err)

		if len(*requestsRef) == 0 {
			panic(
				common.NewHttpError(
					err,
					common.ResponseMeta{Code: http.StatusBadRequest, Msg: "user activation period has expired"},
				),
			)
		}
		userId := (*requestsRef)[0].UserId

		hashedPass, err := auth.HashPassword(req.Password)
		common.CheckErrAndPanic(err)

		//TODO transaction
		q = server.GetQueriesRepo().UpdateUsersQuery(
			common.QueryPartial{
				Query:  "active = true, hashed_password = ?",
				Params: []any{hashedPass},
			},
			common.QueryPartial{
				Query:  "id = ?",
				Params: []any{userId},
			},
		)

		err = server.GetQueryRunner().Update(q)
		common.CheckErrAndPanic(err)

		q = server.GetQueriesRepo().DeletePasswordChangeRequestsQuery(
			common.QueryPartial{
				Query:  "user_id = ?",
				Params: []any{userId},
			},
		)

		err = server.GetQueryRunner().Delete(q)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user is activated")
	}
}
