package reviews

import (
	"github.com/gin-gonic/gin"
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

		q := server.GetQueriesRepo().CreatePaymentQuery(common.GenerateUniqueID(), req.UserId, "rev", paymentState)
		paymentIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)
		paymentId, _ := paymentIdAny.(string)

		q = server.GetQueriesRepo().CreateReviewQuery(paymentId, req.ProfessionalId, req.Review)
		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		if !common.Config.PayContact {
			_, err = server.GetStoreHelpers(ctx).CreateProfessionalContactWithPayment(
				common.CreateUserProfessionalContactRequest{
					ProfessionalId: req.ProfessionalId,
					UserIdRequest: common.UserIdRequest{
						UserId: req.UserId,
					},
				}, common.PaymentStates.Paid)
			if err != common.ErrRecordExist {
				common.CheckErrAndPanic(err)
			}
		}
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
