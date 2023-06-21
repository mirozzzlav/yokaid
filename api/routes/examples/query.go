package examples

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func query(server common.Server) func(ctx *gin.Context) {

	return func(ctx *gin.Context) {
		q := server.GetQueriesRepo().QueryUserTest(
			common.QueryPartial{
				Query:  "",
				Params: []any{},
			},
		)
		
		err := server.GetQueryRunner().GetRows(q, func(result []byte) {
			fmt.Println(result)
		})

		if err != nil {
			fmt.Println(err)
		}

	}

}
