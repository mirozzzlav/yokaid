package professionals

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"some-app/api/common"
)

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req common.CreatePostRequest

		_ = ctx.BindJSON(&req)
		err := server.GetValidate().Struct(req)

		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		authUser := server.GetAuthUser()
		_, err = server.GetStoreHelpers(ctx).CreatePost(authUser.ID, req)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "review has been successfully created")
	}
}
