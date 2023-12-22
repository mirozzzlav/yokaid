package examples

import (
	"github.com/gin-gonic/gin"
	"yokaid/api/common"
	"yokaid/api/upload"
)

func testUpload(_ common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		Upload := upload.NewUpload()

		Upload.Run(upload.Setup{
			Writer:     ctx.Writer,
			Request:    ctx.Request,
			Path:       "./static/images/",
			Extensions: "gif jpg png webp",
			Name:       "image",
			Sub:        Upload.Parameter(ctx.Request),
			Normalize:  true,
			Size:       1024 * 1024 * 32,
			Success: func(u upload.SuccessObject) {
				Upload.Response(upload.Message{
					Id:        u.Id,
					File:      u.File,
					Path:      u.Path,
					Name:      u.Name,
					Parameter: u.Parameter,
				}, ctx.Writer)
			},
			Error: func(err error, httpErrorStatus int) {
				Upload.Response(upload.Message{
					Error:  err.Error(),
					Status: httpErrorStatus,
				}, ctx.Writer)
			},
		})
	}
}
