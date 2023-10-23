package examples

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"some-app/api/common"
)

func transaction(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		username, _ := ctx.Params.Get("username")
		server.GetQueryRunner(ctx).Begin()

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

		err3 := server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err3)

		fmt.Println(users1)
		fmt.Println(users2)

		common.SetOKJSONResponse(ctx, "", users2)

	}
}

func secondTransaction(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		server.GetQueryRunner(ctx).Begin()
		id := server.GetStoreHelpers(ctx).Insert()
		server.GetStoreHelpers(ctx).Update(id)
		server.GetStoreHelpers(ctx).Delete(id)

		server.GetQueryRunner(ctx).Commit()
	}
}
