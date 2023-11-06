package professionals

import (
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

		q := server.GetQueriesRepo().CreatePaymentQuery(common.GenerateUniqueID(), req.UserId, "rev")
		paymentIdAny, err := server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)
		paymentId, _ := paymentIdAny.(string)

		_, err = server.GetStoreHelpers(ctx).CreateReviewAndProfessional(paymentId, req)
		if err == common.ErrRecordExist {
			panic(
				common.HttpResponse{
					Code: http.StatusBadRequest,
					Msg:  "review form existing person",
				},
			)
		}
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(
			ctx,
			"review form success",
			map[string]string{"smsCode": paymentId},
		)
	}
}
