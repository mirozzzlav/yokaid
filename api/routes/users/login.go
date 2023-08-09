package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type loginUserResponse struct {
	AccessToken string          `json:"access_token"`
	User        common.AuthUser `json:"user"`
}

func login(server common.Server) func(ctx *gin.Context) {
	const credentialsErrMsg = "login failed, check your credentials"

	return func(ctx *gin.Context) {
		var req common.LoginUserRequest

		_ = ctx.BindJSON(&req)

		err := server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		user, err := server.GetStoreHelpers(ctx).GetUserAndVerifyPassword(
			req.UsernameOrEmail.(string), req.Password.(string),
		)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, Msg: credentialsErrMsg})

		authUser := common.AuthUser{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
		}
		accessToken, err := server.GetTokenMaker().CreateToken(authUser)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(
			ctx,
			loginUserResponse{
				AccessToken: accessToken,
				User:        authUser,
			},
		)
	}
}
