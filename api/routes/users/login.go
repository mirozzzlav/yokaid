package users

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
)

type loginUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginUserResponse struct {
	AccessToken string          `json:"access_token"`
	User        common.AuthUser `json:"user"`
}

func login(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		defer common.OnPanic(ctx, func(ctx *gin.Context, httpCode int, err error) {
			resultErr := errors.New("login failed, check your credentials")
			if httpCode == http.StatusInternalServerError {
				resultErr = errors.New("server issue has occurred")
			}
			common.SetErrorJSONResponse(ctx, httpCode, resultErr)
		})

		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, http.StatusUnauthorized)

		user, err := server.GetStore().GetAUser(req.Username)
		common.CheckErrAndPanic(err, http.StatusUnauthorized)

		err = auth.CheckPassword(req.Password, user.HashedPassword)
		common.CheckErrAndPanic(err, http.StatusUnauthorized)

		authUser := common.AuthUser{
			Username: user.Username,
			Role:     user.Role,
		}
		accessToken, err := server.GetTokenMaker().CreateToken(authUser)
		common.CheckErrAndPanic(err, http.StatusInternalServerError)

		common.SetOKJSONResponse(
			ctx,
			loginUserResponse{
				AccessToken: accessToken,
				User: common.AuthUser{
					Username: user.Username,
					Role:     user.Role,
				},
			},
		)
	}
}
