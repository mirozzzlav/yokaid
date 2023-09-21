package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func createRequestForPasswordChange(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		var req common.CreatePasswordChangeRequest
		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		server.GetQueryRunner(ctx).Begin()
		user, err := server.GetStoreHelpers(ctx).GetUser(req.Email.(string))
		// we don't want to hacker know that we don't have the user, so we ignore 0 rows error

		if err != nil && err != common.ErrNoRows {
			panic(common.NewHttpError(err))
		}

		if user != nil && user.Active {
			token, err := server.GetStoreHelpers(ctx).CreatePasswordChangeRequest(user.ID)
			common.CheckErrAndPanic(err)

			err = server.GetNotifier().SendPasswordChangeRequest(
				user.Email,
				map[string]string{"userFullName": user.FullName, "passwordChangeToken": token},
			)
			common.CheckErrAndPanic(err)
		}
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "password change request has been sent if the email exist")
	}
}

func passwordChange(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		token, tokenParamExist := ctx.Params.Get("password_change_token")
		if !tokenParamExist {
			panic(common.NewHttpError(nil, errMeta["badRequest"]))
		}
		server.GetQueryRunner(ctx).Begin()
		userId, err := server.GetStoreHelpers(ctx).GetUserFromPasswordChangeRequest(token)
		if err == common.ErrNoRows {
			panic(common.NewHttpError(err, errMeta["badRequestExpired"]))
		}
		common.CheckErrAndPanic(err)

		var req common.PasswordChangeRequest
		_ = ctx.BindJSON(&req)
		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		err = server.GetStoreHelpers(ctx).ChangeUserPassword(userId, req.Password.(string))
		common.CheckErrAndPanic(err)
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "user's password has been changed")
	}
}
