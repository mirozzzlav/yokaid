package reviews

import (
	"fmt"
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
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		q := server.GetQueriesRepo().CreateReviewQuery(req.ProfessionalId, req.Review)
		reviewIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		reviewId, _ := common.ConvertToInt(reviewIdAny)
		err = server.GetStoreHelpers(ctx).CreatePayment(common.GetCodeRequest{
			UserPhone:   req.UserPhone,
			EntityId:    reviewId,
			PaymentType: "rev",
		})
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(
			ctx,
			map[string]string{"smsCode": fmt.Sprintf("rev%d", reviewId)},
		)
	}
}
