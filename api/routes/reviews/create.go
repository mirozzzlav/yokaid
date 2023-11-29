package reviews

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateReviewForExistingProfessionalRequest
		_ = ctx.BindJSON(&req)

		server.GetQueryRunner(ctx).Begin()
		err := server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		paymentState := common.PaymentStates.New
		if !common.Config.PayReview {
			paymentState = common.PaymentStates.Paid
		}

		if common.Config.PayReview {
			q := server.GetQueriesRepo().CheckPaymentExist(req.UserId, "rev")
			_, err := server.GetQueryRunner(ctx).GetScalar(q)
			if err != common.ErrNoRows {
				common.CheckErrAndPanic(err)
			}
			if err == nil {
				panic(
					common.HttpResponse{
						Code: http.StatusBadRequest,
						Msg:  "review form user already reviewed pro",
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

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		if common.Config.PayReview {
			common.SetOKJSONResponse(
				ctx,
				"review form success",
				map[string]string{"smsCode": paymentId},
			)
		} else {
			common.SetOKJSONResponse(
				ctx,
				"review form success no pay",
			)
		}
	}
}
