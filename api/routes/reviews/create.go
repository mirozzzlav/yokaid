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

		server.GetQueryRunner(ctx).Begin()
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		paymentState := common.PaymentStates.New
		if common.Config.PayReview == "" {
			paymentState = common.PaymentStates.Paid
		}

		if common.Config.PayReview != "" {
			q := server.GetQueriesRepo().CheckUserReviewedPro(req.UserId, req.ProfessionalId)
			_, err := server.GetQueryRunner(ctx).GetScalar(q)
			if err != common.ErrNoRows {
				common.CheckErrAndPanic(err)
			}
			if err == nil {
				panic(
					common.HttpResponse{
						Code: http.StatusBadRequest,
						Body: common.HttpResponseBody{
							Msg: "user already reviewed pro",
						},
					},
				)
			}
		}

		q := server.GetQueriesRepo().CreatePaymentQuery(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
		paymentIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)
		paymentId, _ := paymentIdAny.(string)

		q = server.GetQueriesRepo().CreateReviewQuery(paymentId, req.ProfessionalId, req.Review)
		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		if req.Review.MediaFolderId != nil {
			mediaResp, err := common.ConfirmMediaFolder(*req.Review.MediaFolderId)
			if err != nil {
				panic(mediaResp)
			}
		}

		err = server.GetQueryRunner(ctx).Commit()
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
				common.Translate(common.GetLangFromSession(ctx), "verification sms", paymentId),
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
