package frontendData

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
)

type frontEndDataResponse struct {
	Lists           map[string]any               `json:"lists"`
	ValidationRules map[string]map[string]string `json:"validationRules"`
	InputFormats    map[string]string            `json:"inputFormats"`
	SMSPaymentPhone string                       `json:"smsPaymentPhone"`
	ReviewsPerPage  int                          `json:"reviewsPerPage"`
	PayReview       string                       `json:"payReview"`
	PayContact      string                       `json:"payContact"`
}

func getFrontendData(server common.Server) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		lang, ok := ctx.Params.Get("lang")
		if !ok {
			lang = common.Config.DefaultLanguage
		}
		app := server.GetAppService(ctx)
		professions, err := app.Professions().GetAllProfessions(lang)
		common.CheckErrAndPanic(err)

		validationRules, err := common.GetRequestsValidationRules()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "", frontEndDataResponse{
			Lists: map[string]any{
				"profession": professions,
			},
			ValidationRules: validationRules,
			InputFormats: map[string]string{
				"phone":    common.Config.InputFormats["phone"],
				"fullName": "fullName placeholder",
			},
			SMSPaymentPhone: common.Config.SMSPaymentPhone,
			ReviewsPerPage:  common.Config.ReviewsPerPage,
			PayReview:       common.Config.PayReview,
			PayContact:      common.Config.PayContact,
		})
	}
}
func GetRoutes(server common.Server) []common.Route {
	return []common.Route{
		common.NewRoute("/frontend-data/get/:lang", http.MethodGet, getFrontendData(server)),
	}
}
