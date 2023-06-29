package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type registerUserRequest struct {
	FullName string `json:"full_name" validate:"required,min=3"`
	Email    string `json:"email" validate:"required,email"`
	Role     string `json:"role" validate:"required,publicRoles"`
}

var badReqMeta = common.ResponseMeta{
	Code: http.StatusBadRequest,
	Msg:  "user with given email already exist",
}

func register(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req registerUserRequest

		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		usersCount, err := server.GetStoreHelpers().GetUsersCount(req.Email)
		common.CheckErrAndPanic(err)

		if usersCount != 0 {
			panic(common.NewHttpError(nil, badReqMeta))
		}

		err = server.GetStoreHelpers().RegisterUser(req.FullName, req.Email, req.Role)
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "user registered")
	}
}
