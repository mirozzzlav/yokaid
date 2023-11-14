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
	ReviewsPerPage  int                             `json:"reviewsPerPage"`
}

func getFrontendData(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		lang, ok := ctx.Params.Get("lang")
		if !ok {
			lang = common.Config.DefaultLanguage
		}
		server.GetQueryRunner(ctx).Begin()
		professions, err := server.GetStoreHelpers(ctx).GetProfessionalProfessionsForFilter(lang)
		common.CheckErrAndPanic(err)
		validationRules, err := common.GetRequestsValidationRules()
		common.CheckErrAndPanic(err)

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "", frontEndDataResponse{
			Filters: map[string]*[]common.FilterItem{
				"profession": professions,
			},
			ValidationRules: validationRules,
			InputFormats: map[string]string{
				"phone":    common.Config.InputFormats["phone"],
				"fullName": "fullname placeholder",
			},
			SMSPaymentPhone: common.Config.SMSPaymentPhone,
			ReviewsPerPage:  common.Config.ReviewsPerPage,
		})
	}
}
func GetRoutes(server common.Server) []common.Route {
	return []common.Route{
		common.NewRoute("/frontend-data/get/:lang", http.MethodGet, getFrontendData(server)),
	}
}
