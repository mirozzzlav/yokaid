package reviews

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
	"yokaid/api/send_service"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateReviewForExistingProfessionalRequest
		_ = ctx.BindJSON(&req)

		app := server.GetAppService(ctx)
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		paymentState := common.PaymentStates.New
		if common.Config.PayReview == "" {
			paymentState = common.PaymentStates.Paid
		}

		if req.Review.MediaFolderId != nil {
			mediaResp, err := common.ConfirmMediaFolder(*req.Review.MediaFolderId)
			if err != nil {
				panic(mediaResp)
			}
		}

		paymentId, err := app.Reviews().CreateReviewForExistingProfessionalWithPayment(req, paymentState, common.Config.PayReview != "")
		if err == common.ErrRecordExist {
			panic(
				common.HttpResponse{
					Code: http.StatusBadRequest,
					Body: common.HttpResponseBody{
						Msg: "user already reviewed pro",
					},
				},
			)
		}
		common.CheckErrAndPanic(err)

		if common.Config.PayReview == "sms" {
			common.SetOKJSONResponse(
				ctx,
				"review form success",
				map[string]string{"smsCode": paymentId},
			)
		} else if common.Config.PayReview == "verify" {
			phoneNr := fmt.Sprintf("+%s", common.GetNumberSanitized(string(req.UserId)))
			send_service.SendSMS(
				phoneNr,
				fmt.Sprintf(common.Translate(common.GetLangFromSession(ctx), "verification sms"), paymentId),
			)
			common.SetOKJSONResponse(
				ctx,
				"review form success verify",
			)

		} else {
			common.SetOKJSONResponse(
				ctx,
				"review form success no pay",
			)
		}
	}
}
