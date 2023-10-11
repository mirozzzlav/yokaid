package frontendData

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

type frontEndDataResponse struct {
	Filters         map[string]*[]common.FilterItem `json:"filters"`
	ValidationRules map[string]map[string]string    `json:"validationRules"`
	InputFormats    map[string]string               `json:"inputFormats"`
	SMSPaymentPhone string                          `json:"smsPaymentPhone"`
}

func getFrontendData(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		server.GetQueryRunner(ctx).Begin()
		professions, err := server.GetStoreHelpers(ctx).GetProfessionalProfessionsForFilter()
		common.CheckErrAndPanic(err)
		validationRules, err := common.GetRequestsValidationRules()
		common.CheckErrAndPanic(err)

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, frontEndDataResponse{
			Filters: map[string]*[]common.FilterItem{
				"profession": professions,
			},
			ValidationRules: validationRules,
			InputFormats: map[string]string{
				"phone":    common.Config.InputFormats["phone"],
				"fullName": "First name + Last name",
			},
			SMSPaymentPhone: common.Config.SMSPaymentPhone,
		})
	}
}
func GetRoutes(server common.Server) []common.Route {
	return []common.Route{
		common.NewRoute("/frontend-data/get", http.MethodGet, getFrontendData(server)),
	}
}
