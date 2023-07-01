package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type userActivationReq struct {
	Password string `json:"password" validate:"passwords"`
}

func activate(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req userActivationReq
		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		token, tokenParamExist := ctx.Params.Get("activation_token")
		if !tokenParamExist {
			panic(common.NewHttpError(nil, errMeta["badRequest"]))
		}

		userId, err := server.GetStoreHelpers().GetUserFromPasswordChangeRequest(token)
		if err == common.ErrNoRows {
			panic(common.NewHttpError(nil, errMeta["badRequestExpired"]))
		}
		common.CheckErrAndPanic(err)

		err = server.GetStoreHelpers().ChangeUserPassword(userId, req.Password)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "user is activated")
	}
}
