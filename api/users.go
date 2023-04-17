package main

import (
	// "database/sql"

	"errors"
	"fmt"
	"net/http"
	"rental-app/api/db"
	"rental-app/api/utils"
	"time"

	"github.com/gin-gonic/gin"
)

// type DbUser struct {
// 		Username	string
// 		FullName	string
// 		Email			string
// 		HashedPassword string
// 		PasswordChangedAt time.Time
// 		CreatedAt				time.Time
// }

// var mockedUser = DbUser{
// 	Username: "miro",
// 	FullName: "miro furo",
// 	Email: "miro@tuta.io",
// 	HashedPassword: "$2y$10$qCU7HWIZ6.ovOSLys1PLDOpyMGwCpE7eTqCB5cwtn2WtsO2iHK.1e",
// 	PasswordChangedAt: time.Now().Add(- 12 * time.Hour),
//   CreatedAt:         time.Now().Add(- 24 * time.Hour),
// }

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

// func (resp loginUserResponse) MarshalJSON() ([]byte, error) {
// 	return json.Marshal(resp)
// }

func newUserResponse(user db.User) userResponse {
	// var userPasswordChangeAt *time.Time = nil
	// if user.PasswordChangedAt.Valid {
	// 	userPasswordChangeAt = &user.PasswordChangedAt.Time
	// }

	return userResponse{
		Username:          user.Username,
		FullName:          user.Fullname,
		Email:             user.Email,
		PasswordChangedAt: time.Now(),
		CreatedAt:         user.CreatedAt,
	}
}

func (server *Server) loginUser(ctx *gin.Context) {
	var req loginUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(err))
		return
	}
	user, err := server.store.GetAUser(ctx, req.Username)

	if err == nil {
		err = utils.CheckPassword(req.Password, user.HashedPassword)
	}

	if err != nil {
		ctx.JSON(
			http.StatusUnauthorized,
			utils.ErrorResponse(fmt.Errorf("user %s cannot be logged-in", req.Username)),
		)
		return
	}

	accessToken, err := server.tokenMaker.CreateToken(
		user.Username,
		server.config.AccessTokenDuration,
	)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			utils.ErrorResponse(errors.New("server issue has occured")),
		)
		return
	}
	userResponse := loginUserResponse{
		AccessToken: accessToken,
		User:        newUserResponse(user),
	}

	ctx.JSON(http.StatusOK, utils.OkResponse(userResponse))
}
