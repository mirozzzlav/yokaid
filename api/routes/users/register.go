package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

var badReqMeta = common.ResponseMeta{
	Code: http.StatusBadRequest,
	Msg:  "user with given email already exist",
}

func register(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req common.RegisterUserRequest

		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		email := req.Email.(string)
		fullName := req.FullName.(string)

		server.GetQueryRunner(ctx).Begin()
		usersCount, err := server.GetStoreHelpers(ctx).GetUsersCount(email)
		common.CheckErrAndPanic(err)

		if usersCount != 0 {
			panic(common.NewHttpError(nil, badReqMeta))
		}

		activationToken, err := server.GetStoreHelpers(ctx).RegisterUser(req)
		common.CheckErrAndPanic(err)

		err = server.GetNotifier().SendUserActivation(
			email,
			map[string]string{"userFullName": fullName, "activationToken": activationToken},
		)
		common.CheckErrAndPanic(err)
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "user registered")
	}
}
