package professionals

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"yokaid/api/common"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateReviewAndProfessionalRequest
		_ = ctx.BindJSON(&req)

		err := server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		paymentState := common.PaymentStates.New
		if common.Config.PayReview == "" {
			paymentState = common.PaymentStates.Paid
		}

		q := server.GetQueriesRepo().CreatePaymentQuery(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
		paymentIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)
		paymentId, _ := paymentIdAny.(string)

		_, err = server.GetStoreHelpers(ctx).CreateReviewAndProfessional(paymentId, req)
		if err == common.ErrRecordExist {
			panic(
				common.HttpResponse{
					Code: http.StatusBadRequest,
					Body: common.HttpResponseBody{
						Msg: "review form existing person",
					},
				},
			)
		}
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
			common.SendSMS(
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
