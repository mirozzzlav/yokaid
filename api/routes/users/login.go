package users

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
	"rental-app/api/common"
	"rental-app/api/db"
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
	loginErr := errors.New("login failed, check your credentials")
	return func(ctx *gin.Context) {
		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, http.StatusUnauthorized, loginErr)

		user, userFiller := common.UserFiller()
		q := db.GetUserQuery(
			common.QueryPartial{
				Query:  "username = ?",
				Params: []any{req.Username},
			},
		)
		err = server.GetQueryRunner().GetRows(q, userFiller)
		if user == nil || err != nil {
			panic(common.NewHttpError(loginErr, http.StatusUnauthorized, nil))
		}
		common.CheckErrAndPanic(err, http.StatusUnauthorized, loginErr)
		err = auth.CheckPassword(req.Password, user.HashedPassword)
		common.CheckErrAndPanic(err, http.StatusUnauthorized, loginErr)

		authUser := common.AuthUser{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
		}
		accessToken, err := server.GetTokenMaker().CreateToken(authUser)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, errors.New("internal error on login"))

		common.SetOKJSONResponse(
			ctx,
			loginUserResponse{
				AccessToken: accessToken,
				User:        authUser,
			},
		)
	}
}
