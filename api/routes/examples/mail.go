package examples

import (
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func submitEmail(server common.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		err := server.GetNotifier().SendNotification(
			"martinbenadik@gmail.com",
			"My test email",
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry.<br />"+
				"Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br />"+
				"It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.<br />"+
				"It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.<br />",
		)

		common.CheckErrAndPanic(err)
		common.SetOKJSONResponse(ctx, "Email has been sent.")

	}
}
