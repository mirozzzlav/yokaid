package posts

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func list(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		posts, postsModelLoader := common.PostsModelLoader()
		var err error
		filter, _ := ctx.Params.Get("filter")

		filterQP, err := server.GetStoreHelpers().HandleFilter(filter)
		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().ListPostsQuery(filterQP)
		err = server.GetQueryRunner().GetRows(dbQuery, postsModelLoader)

		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, posts)
	}
}
