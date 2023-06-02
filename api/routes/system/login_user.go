package system

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
	"time"
)

type userResponse struct {
	Username          string    `json:"username"`
	FullName          string    `json:"full_name"`
	Email             string    `json:"email"`
	PasswordChangedAt time.Time `json:"password_changed_at"` // can be null
	CreatedAt         time.Time `json:"created_at"`
}

type loginUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginUserResponse struct {
	AccessToken          string       `json:"access_token"`
	AccessTokenExpiresAt time.Time    `json:"access_token_expires_at"`
	User                 userResponse `json:"user"`
}

func LoginUser(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		var req loginUserRequest

		getLoginError := func(userName *string) error {
			message := "login failed"
			if userName != nil {
				message = fmt.Sprintf("user %s cannot be logged-in", *userName)
			}
			return errors.New(message)
		}

		err := ctx.ShouldBindJSON(&req)
		if err != nil {
			common.SetErrorJSONResponse(ctx, http.StatusUnauthorized, getLoginError(nil))
		}
		user, err := server.GetStore().GetAUser(req.Username)

		if err != nil {
			common.SetErrorJSONResponse(ctx, http.StatusUnauthorized, getLoginError(&req.Username))
		}

		err = auth.CheckPassword(req.Password, user.HashedPassword)
		if err != nil {
			common.SetErrorJSONResponse(ctx, http.StatusUnauthorized, getLoginError(&req.Username))
		}
		authUser := common.AuthUser{
			Username: user.Username,
			Role:     user.Role,
		}
		accessToken, err := server.GetTokenMaker().CreateToken(authUser)
		if err != nil {
			common.SetErrorJSONResponse(
				ctx, http.StatusInternalServerError, errors.New("server issue has occurred"))
		}

		common.SetOKJSONResponse(
			ctx,
			loginUserResponse{
				AccessToken: accessToken,
				User: userResponse{
					Username:          user.Username,
					FullName:          user.Fullname,
					Email:             user.Email,
					PasswordChangedAt: time.Now(),
					CreatedAt:         user.CreatedAt,
				},
			},
		)
	}
}
