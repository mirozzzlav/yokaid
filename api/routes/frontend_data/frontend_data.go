package frontendData

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type frontEndDataResponse struct {
	ItemCategories []string
}

func getFrontendData(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		itemCategories, columnModalLoader := common.ColummModalLoader("Name")
		var err error
		server.GetQueryRunner(ctx).Begin()
		err = server.GetQueryRunner(ctx).GetRows(server.GetQueriesRepo().ListItemCategoriesQuery(), columnModalLoader)
		common.CheckErrAndPanic(err)
		err = server.GetQueryRunner(ctx).Commit()

		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, frontEndDataResponse{
			ItemCategories: *itemCategories,
		})
	}
}
func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/frontend-data/get", false, http.MethodGet, getFrontendData(server)},
	}
}
