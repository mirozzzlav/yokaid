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
		err := server.GetValidate().Struct(req)

		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		server.GetQueryRunner(ctx).Begin()
		q := server.GetQueriesRepo().CreateReviewQuery(req.ProfessionalId, req.Review)
		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "review has been successfully created")
	}
}
