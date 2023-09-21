package filterItems

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
	"strings"
)

func getFilterItems(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		searchTerm, paramExist := ctx.Params.Get("searchTerm")
		if !paramExist {
			searchTerm = ""
		}
		filteredEntitiesStr, paramExist := ctx.Params.Get("filteredEntities")
		if !paramExist || filteredEntitiesStr == "" {
			panic(common.NewHttpError(nil, common.ResponseMeta{Code: http.StatusBadRequest}))

		}
		filteredEntities := strings.Split(filteredEntitiesStr, ";")
		server.GetQueryRunner(ctx).Begin()
		filterItems, err := server.GetStoreHelpers(ctx).GetFilterItems(filteredEntities, searchTerm, 10)
		if err != nil && err != common.ErrNoRows {
			common.CheckErrAndPanic(err)
		}
		server.GetQueryRunner(ctx).Commit()

		common.SetOKJSONResponse(ctx, filterItems)
	}
}
func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/filter-items/get/:filteredEntities/:searchTerm", false, http.MethodGet, getFilterItems(server)},
		{"/filter-items/get/:filteredEntities", false, http.MethodGet, getFilterItems(server)},
	}
}
