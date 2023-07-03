package posts

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"rental-app/api/common"
)

type createPostRequest struct {
	Latitude  float32 `validate:"required,numeric"`
	Longitude float32 `validate:"required,numeric"`
	Text      string  `validate:"required,min=3"`
}

func create(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req createPostRequest

		err := ctx.BindJSON(&req)
		common.CheckErrAndPanic(err)

		err = server.GetValidate().Struct(req)
		validationErrors := common.GetValidationErrors(err)
		common.CheckErrAndPanic(err, common.ResponseMeta{Code: http.StatusBadRequest, ExtraData: validationErrors})

		authUser := server.GetAuthUser()
		_, err = server.GetStoreHelpers().CreatePost(authUser.ID, req.Latitude, req.Longitude, req.Text)
		common.CheckErrAndPanic(err)

		common.SetOKJSONResponse(ctx, "post has been successfully created")
	}
}
