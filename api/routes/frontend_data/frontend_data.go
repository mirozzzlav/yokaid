package frontendData

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type frontEndDataResponse struct {
	Filters map[string]*[]common.FilterItem `json:"filters"`
}

func getFrontendData(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		categories, err := server.GetStoreHelpers(ctx).GetCategoriesForFilter()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, frontEndDataResponse{
			Filters: map[string]*[]common.FilterItem{
				"what": categories,
			},
		})
	}
}
func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/frontend-data/get", false, http.MethodGet, getFrontendData(server)},
	}
}
