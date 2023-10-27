package professionals

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateReviewAndProfessionalRequest
		_ = ctx.BindJSON(&req)

		err := server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		common.CheckErrAndPanic(err)

		reviewId, err := server.GetStoreHelpers(ctx).CreateReviewAndProfessional(req)
		if err == common.ErrRecordExist {
			panic(
				common.HttpResponse{
					Code: http.StatusBadRequest,
					Msg:  "Person with the given phone or email already exist.",
				},
			)
		}
		common.CheckErrAndPanic(err)

		q := server.GetQueriesRepo().CreatePaymentQuery(common.GetCodeRequest{
			UserPhone:   req.UserPhone,
			EntityId:    reviewId,
			PaymentType: "rev",
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
