package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/auth"
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

const credentialsErr = "login failed, check your credentials"

func getVerifiedUser(server common.Server, usernameOrEmail string, password string) (*common.User, *common.HttpError) {
	loginErr := common.NewHttpError(
		nil,
		common.ResponseMeta{
			Code: http.StatusUnauthorized,
			Msg:  credentialsErr,
		},
	)

	usersRef, UsersModelLoader := common.UsersModelLoader()
	q := server.GetQueriesRepo().GetUsersQuery(
		common.QueryPartial{
			Query:  "username = ? or email = ?",
			Params: []any{usernameOrEmail, usernameOrEmail},
		},
	)
	err := server.GetQueryRunner().GetRows(q, UsersModelLoader)
	if err != nil {
		loginErr = common.NewHttpError(err)
		return nil, &loginErr
	}
	if len(*usersRef) == 0 {
		return nil, &loginErr
	}
	user := (*usersRef)[0]

	if user.Active == false {
		loginErr = common.NewHttpError(
			nil,
			common.ResponseMeta{
				Code: http.StatusUnauthorized,
				Msg:  "login failed, user is not activated",
			})
		return nil, &loginErr
	}

	err = auth.CheckPassword(password, user.HashedPassword)
	if err != nil {
		return nil, &loginErr
	}

	return &user, nil

}

func login(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req loginUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusUnauthorized, Msg: credentialsErr})

		user, httpErr := getVerifiedUser(server, req.UsernameOrEmail, req.Password)
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
