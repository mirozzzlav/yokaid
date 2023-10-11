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

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, map[string]string{"smsCode": fmt.Sprintf("rev%d", reviewId)})
	}
}
