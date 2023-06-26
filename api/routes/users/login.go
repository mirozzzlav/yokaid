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

const credentialsErr = "login failed, check your credentials"

func getVerifiedUser(server common.Server, username string, password string) (*common.User, *common.HttpError) {
	loginErr := common.NewHttpError(
		nil,
		common.ResponseMeta{
			Code: http.StatusUnauthorized,
			Msg:  credentialsErr,
		},
	)

	user, userModelLoader := common.UserModelLoader()
	q := server.GetQueriesRepo().GetUserQuery(
		common.QueryPartial{
			Query:  "username = ?",
			Params: []any{username},
		},
	)
	err := server.GetQueryRunner().GetRows(q, userModelLoader)
	if err != nil {
		loginErr = common.NewHttpError(err)
		return nil, &loginErr
	}
	if user == nil {
		return nil, &loginErr
	}
	err = auth.CheckPassword(password, user.HashedPassword)
	if err != nil {
		return nil, &loginErr
	}

	if user.PasswordChangedAt == nil {
		loginErr = common.NewHttpError(
			nil,
			common.ResponseMeta{
				Code: http.StatusUnauthorized,
				Msg:  "login failed, user is not activated",
			})
		return nil, &loginErr
	}

	return user, nil

}

func login(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized, Msg: credentialsErr})

		user, httpErr := getVerifiedUser(server, req.Username, req.Password)
		if httpErr != nil {
			panic(*httpErr)
		}

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
