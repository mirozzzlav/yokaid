package reviews

import (
	"fmt"
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

		q := server.GetQueriesRepo().CreateReviewQuery(req.ProfessionalId, req.Review)
		reviewIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		reviewId, _ := common.ConvertToInt(reviewIdAny)

		q = server.GetQueriesRepo().CreatePaymentQuery(common.GetCodeRequest{
			UserPhone:   req.UserPhone,
			PaymentType: "rev",
			EntityId:    reviewId,
		})
		requestId, err := server.GetQueryRunner(ctx).Exec(q, "request_id")
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(
			ctx,
			"",
			map[string]string{"smsCode": fmt.Sprintf("rev%d", requestId)},
		)
	}
}
