package professionals

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreateProfessionalWithReviewRequest
		_ = ctx.BindJSON(&req)

		err := server.GetQueryRunner(ctx).Begin()
		common.CheckErrAndPanic(err)

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

		err = server.GetStoreHelpers(ctx).CreateProfessionalWithReview(req)
		if err == common.ErrRecordExist {
			panic(
				common.NewHttpError(
					err,
					common.ResponseMeta{
						Code: http.StatusBadRequest,
						Msg:  "Person with the given phone or email already exist.",
					},
				),
			)
		}
		common.CheckErrAndPanic(err)

		//TODO sending code through SMS
		_, err = server.GetQueryRunner(ctx).Exec(
			server.GetQueriesRepo().DeleteVerificationCodeQuery(req.VerificationPhone),
			"phone",
		)
		common.CheckErrAndPanic(err)

		err = server.GetQueryRunner(ctx).Commit()
		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "Review has been successfully created.")
	}
}
