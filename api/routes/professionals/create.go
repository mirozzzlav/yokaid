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
		err := server.GetValidate().Struct(req)

		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		server.GetQueryRunner(ctx).Begin()
		err = server.GetStoreHelpers(ctx).CreateProfessionalWithReview(req)
		if err == common.ErrRecordExist {
			panic(
				common.NewHttpError(
					err,
					common.ResponseMeta{
						Code: http.StatusBadRequest,
						Msg:  "person with the given phone or email already exist",
					},
				),
			)
		}
		common.CheckErrAndPanic(err)
		server.GetQueryRunner(ctx).Commit()
		common.SetOKJSONResponse(ctx, "review has been successfully created")
	}
}
