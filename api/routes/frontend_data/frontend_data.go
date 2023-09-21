package frontendData

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

type frontEndDataResponse struct {
	Filters         map[string]*[]common.FilterItem `json:"filters"`
	ValidationRules map[string]map[string]string    `json:"validationRules"`
}

func getFrontendData(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		server.GetQueryRunner(ctx).Begin()
		services, err := server.GetStoreHelpers(ctx).GetProfessionalServicesForFilter()
		common.CheckErrAndPanic(err)
		validationRules, err := common.GetRequestsValidationRules()
		common.CheckErrAndPanic(err)

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, frontEndDataResponse{
			Filters: map[string]*[]common.FilterItem{
				"what": services,
			},
			ValidationRules: validationRules,
		})
	}
}
func GetRoutes(server common.Server) []common.Route {

	return []common.Route{
		{"/frontend-data/get", false, http.MethodGet, getFrontendData(server)},
	}
}
