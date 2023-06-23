package users

import (
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
	loginErrMsg := "login failed, check your credentials"
	return func(ctx *gin.Context) {
		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized, Msg: loginErrMsg})

		user, userModelLoader := common.UserModelLoader()
		q := server.GetQueriesRepo().GetUserQuery(
			common.QueryPartial{
				Query:  "username = ?",
				Params: []any{req.Username},
			},
		)
		err = server.GetQueryRunner().GetRows(q, userModelLoader)
		common.CheckErrAndPanic(err)
		if user == nil {
			panic(
				common.NewHttpError(
					nil,
					common.ResponseMeta{Code: http.StatusUnauthorized, Msg: loginErrMsg},
				),
			)
		}
		err = auth.CheckPassword(req.Password, user.HashedPassword)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized, Msg: loginErrMsg})

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
