package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func activate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		token, tokenParamExist := ctx.Params.Get("activation_token")
		if !tokenParamExist {
			panic(common.NewHttpError(nil, errMeta["badRequest"]))
		}
		userId, err := server.GetStoreHelpers(ctx).GetUserFromPasswordChangeRequest(token)
		if err == common.ErrNoRows {
			panic(common.NewHttpError(nil, errMeta["badRequestExpired"]))
		}
		common.CheckErrAndPanic(err)

		var req common.PasswordChangeRequest

		_ = ctx.BindJSON(&req)
		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		err = server.GetStoreHelpers(ctx).ChangeUserPassword(userId, req.Password.(string))
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user is activated")
	}
}
