package examples

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func transaction(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		username, _ := ctx.Params.Get("username")

		query1 := server.GetQueriesRepo().QueryUserTest(
			common.QueryPartial{
				Query:  " WHERE username= ?",
				Params: []any{username},
			},
		)

		users1, usersLoader := common.UsersModelLoader()
		err1 := server.GetQueryRunner(ctx).GetRows(query1, usersLoader)
		common.CheckErrAndPanic(err1)

		query2 := server.GetQueriesRepo().QueryUserTest(
			common.QueryPartial{
				Query:  " WHERE username= ?",
				Params: []any{username},
			},
		)

		users2, usersLoader2 := common.UsersModelLoader()
		err2 := server.GetQueryRunner(ctx).GetRows(query2, usersLoader2)
		common.CheckErrAndPanic(err2)

		fmt.Println(users1)
		fmt.Println(users2)

		common.SetOKJSONResponse(ctx, users2)

	}
}

func secondTransaction(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		username, _ := ctx.Params.Get("username")

		server.GetQueryRunner(ctx).Begin()
		q := server.GetQueriesRepo().QueryUserTest(
			common.QueryPartial{
				Query:  " WHERE username= ?",
				Params: []any{username},
			},
		)

		users, usersLoader := common.UsersModelLoader()
		err := server.GetQueryRunner(ctx).GetRows(q, usersLoader)
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, users)
	}
}

func thirdTransaction(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		id := server.GetStoreHelpers(ctx).Insert()
		server.GetStoreHelpers(ctx).Update(id)
		server.GetStoreHelpers(ctx).Delete(id)

		server.GetQueryRunner(ctx).Commit()
	}
}
