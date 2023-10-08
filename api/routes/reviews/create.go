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
		codeValid, err := server.GetStoreHelpers(ctx).CheckVerification(req.VerificationPhone, req.VerificationCode)
		if !codeValid {
			panic(common.NewHttpError(
				nil,
				common.ResponseMeta{Code: http.StatusBadRequest, Msg: "It appears that you've entered an incorrect SMS code. Please double-check the code and try again."},
			))
		}
		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		q := server.GetQueriesRepo().CreateReviewQuery(req.ProfessionalId, req.Review)
		_, err = server.GetQueryRunner(ctx).Exec(q)
		common.CheckErrAndPanic(err)

		//TODO sending code through SMS
		_, err = server.GetQueryRunner(ctx).Exec(
			server.GetQueriesRepo().DeleteVerificationCodeQuery(req.VerificationPhone),
			"phone",
		)
		common.CheckErrAndPanic(err)

		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "Review has been successfully created.")
	}
}
