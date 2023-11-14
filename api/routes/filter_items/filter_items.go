package filterItems

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
	"strings"
)

func getFilterItems(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		lang := common.GetLangFromSession(ctx)

		searchTerm, paramExist := ctx.Params.Get("searchTerm")
		if !paramExist {
			searchTerm = ""
		}
		columnAliasesStr, paramExist := ctx.Params.Get("columnAliases")
		if !paramExist || columnAliasesStr == "" {
			panic(common.GetHttpResponseFromError(common.ErrBadInputs))

		}
		columnAliases := strings.Split(columnAliasesStr, ";")
		server.GetQueryRunner(ctx).Begin()
		filterItems, err := server.GetStoreHelpers(ctx).GetFilterItems(
			columnAliases, searchTerm, 10, lang)
		if err != nil && err != common.ErrNoRows {
			common.CheckErrAndPanic(err)
		}
		server.GetQueryRunner(ctx).Commit()

		common.SetOKJSONResponse(ctx, "", filterItems)
	}
}
func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		common.NewRoute("/filter-items/get/:columnAliases/:searchTerm", http.MethodGet, getFilterItems(server)),
		common.NewRoute("/filter-items/get/:columnAliases", http.MethodGet, getFilterItems(server)),
	}
}
