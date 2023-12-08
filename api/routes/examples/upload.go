package examples

import (
	"github.com/gin-gonic/gin"
	"log"
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
			Size:       1024 * 1024 * 32,
			Success: func(file string, idx string) {
				Upload.Response(upload.Message{
					File: file,
				}, ctx.Writer)
			},
			Error: func(err error, httpErrorStatus int) {

				log.Printf("Error: %v", err)

				Upload.Response(upload.Message{
					Error:  err.Error(),
					Status: httpErrorStatus,
				}, ctx.Writer)
			},
		})
	}
}
