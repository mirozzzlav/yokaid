package users

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
	"rental-app/api/db"
)

type registerUserRequest struct {
	FullName string `json:"full_name" validate:"required,min=3"`
	Email    string `json:"email" validate:"required,email"`
	Role     string `json:"role" validate:"required,publicRoles"`
}

func getUsersCount(server common.Server, email string) (int, error) {
	q := server.GetQueriesRepo().GetUsersCountQuery(common.QueryPartial{
		Query:  "email = ?",
		Params: []any{email},
	})
	usersCount, err := server.GetQueryRunner().GetScalar(q)
	if err != nil {
		return 0, err
	}
	return usersCount, err
}

func register(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		var req registerUserRequest

		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		usersCount, err := getUsersCount(server, req.Email)
		common.CheckErrAndPanic(err)

		if usersCount != 0 {
			panic(common.NewHttpError(
				nil,
				common.ResponseMeta{
					Code: http.StatusBadRequest,
					Msg:  "user with given email already exist",
				},
			))
		}

		username, err := db.GenerateUserName(server, req.FullName)
		common.CheckErrAndPanic(err)

		//TODO transaction
		q := server.GetQueriesRepo().CreateUserQuery(
			common.QueryPartial{
				Query:  "(username, full_name, email, role) VALUES (?, ?, ?, ?)",
				Params: []any{username, req.FullName, req.Email, req.Role},
			},
		)
		createdId, err := server.GetQueryRunner().Create(q, "id")
		common.CheckErrAndPanic(err)

		q = server.GetQueriesRepo().CreatePasswordChangeRequestQuery(
			common.QueryPartial{Query: "(user_id) VALUES (?)", Params: []any{createdId}},
		)
		_, err = server.GetQueryRunner().Create(q, "")
		common.CheckErrAndPanic(err)

		//TODO transaction end
		common.SetOKJSONResponse(ctx, "user registered")
	}
}
