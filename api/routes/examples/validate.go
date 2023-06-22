package examples

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"regexp"
	"rental-app/api/common"
)

func emailValidation(fl validator.FieldLevel) bool {
	email := fl.Field().String()

	matched, _ := regexp.MatchString("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", email)

	return matched
}

type updateUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required"`
}

func validate(server common.Server) func(ctx *gin.Context) {
	validationErr := errors.New("bad inputs, user validation failed")
	noUserErr := errors.New("given user doesn't exist")

	return func(ctx *gin.Context) {
		var req updateUserRequest

		err := ctx.ShouldBindJSON(&req)
		common.CheckErrAndPanic(err, http.StatusBadRequest, validationErr)

		id, idParamExist := ctx.Params.Get("id")
		if !idParamExist {
			panic(common.NewHttpError(noUserErr, http.StatusBadRequest, nil))
		}
		q := server.GetQueriesRepo().UpdateUserQuery(
			common.QueryPartial{
				Query:  "username = ?, fullname = ?, email = ?",
				Params: []any{req.Username, req.Fullname, req.Email},
			},
			common.QueryPartial{
				Query:  "id = ?",
				Params: []any{id},
			},
		)

		updatedUsers, err := server.GetQueryRunner().Update(q)
		common.CheckErrAndPanic(err, http.StatusInternalServerError, errors.New("internal error while updating user"))

		if updatedUsers == 0 {
			panic(common.NewHttpError(noUserErr, http.StatusBadRequest, nil))
		}
		common.SetOKJSONResponse(ctx, "user successfully updated")
	}
}
