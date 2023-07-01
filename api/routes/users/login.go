package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type loginUserRequest struct {
	UsernameOrEmail string `json:"username_or_email" binding:"required"`
	Password        string `json:"password" binding:"required"`
}

type loginUserResponse struct {
	AccessToken string          `json:"access_token"`
	User        common.AuthUser `json:"user"`
}

func login(server common.Server) func(ctx *gin.Context) {
	const credentialsErrMsg = "login failed, check your credentials"

	return func(ctx *gin.Context) {
		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, Msg: credentialsErrMsg})

		user, err := server.GetStoreHelpers().GetUserAndVerifyPassword(req.UsernameOrEmail, req.Password)
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
