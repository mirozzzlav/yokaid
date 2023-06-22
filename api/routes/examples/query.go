package examples

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func query(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		username, _ := ctx.Params.Get("username")
		q := server.GetQueriesRepo().QueryUserTest(
			common.QueryPartial{
				Query:  " WHERE username= ?",
				Params: []any{username},
			},
		)
		users, usersLoader := common.UserModelLoader()
		err := server.GetQueryRunner().GetRows(q, usersLoader)

		if err != nil {
			fmt.Println(err)
		}
		common.SetOKJSONResponse(ctx, users)

	}

}
