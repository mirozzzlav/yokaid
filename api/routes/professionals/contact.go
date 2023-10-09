package professionals

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func contact(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.ContactProfessionalRequest
		_ = ctx.BindJSON(&req)

		//err := server.GetQueryRunner(ctx).Begin()
		//common.CheckErrAndPanic(err)

		err := server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		// TODO sending pro a message

		//err = server.GetQueryRunner(ctx).Commit()
		//common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "Your message has been sent.")
	}
}
