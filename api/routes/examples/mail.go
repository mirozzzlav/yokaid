package examples

import (
	"errors"
	"github.com/gin-gonic/gin"
	"rental-app/api/common"
)

func submitEmail(server common.Server) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {

		statusCode := common.SubmitMail(ctx, common.Mail{
			To:      "miroslav.furinda@gmail.com",
			Subject: "My test email",
			Message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.<br />" +
				"Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.<br />" +
				"It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.<br />" +
				"It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.<br />",
		})

		if statusCode == 202 {
			common.SetOKJSONResponse(ctx, "Email sent successfully")
		} else {
			common.SetErrorJSONResponse(ctx, statusCode, errors.New("error sending email"))
		}

	}
}
