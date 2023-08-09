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

		filterQP, err := server.GetStoreHelpers(ctx).HandleFilter(filter)
		common.CheckErrAndPanic(err)

		dbQuery := server.GetQueriesRepo().ListPostsQuery(filterQP)
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(dbQuery, postsModelLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, posts)
	}
}
