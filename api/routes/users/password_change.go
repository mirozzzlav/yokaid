package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type createPasswordChangeReq struct {
	Email string `validate:"required,email"`
}

func createRequestForPasswordChange(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		var req createPasswordChangeReq
		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		user, err := server.GetStoreHelpers().GetUser(req.Email)
		// we don't want to hacker know that we don't have the user, so we ignore 0 rows error

		if err != nil && err != common.ErrNoRows {
			panic(common.NewHttpError(err))
		}

		if user != nil && user.Active {
			token, err := server.GetStoreHelpers().CreatePasswordChangeRequest(user.ID)
			common.CheckErrAndPanic(err)

			err = server.GetNotifier().SendPasswordChangeRequest(
				user.Email,
				map[string]string{"userFullName": user.FullName, "passwordChangeToken": token},
			)
			common.CheckErrAndPanic(err)
		}

		common.SetOKJSONResponse(ctx, "password change request has been sent if the email exist")
	}
}

type userPasswordChangeReq struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"passwords"`
}

func passwordChange(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		token, tokenParamExist := ctx.Params.Get("password_change_token")
		if !tokenParamExist {
			panic(common.NewHttpError(nil, errMeta["badRequest"]))
		}

		var req userPasswordChangeReq
		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		userId, err := server.GetStoreHelpers().GetUserFromPasswordChangeRequest(token)
		if err == common.ErrNoRows {
			panic(common.NewHttpError(err, errMeta["badRequestExpired"]))
		}
		common.CheckErrAndPanic(err)
		err = server.GetStoreHelpers().ChangeUserPassword(userId, req.NewPassword)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user's password has been changed")
	}
}
