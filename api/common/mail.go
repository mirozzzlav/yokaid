package common

import (
	"github.com/gin-gonic/gin"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"net/http"
	"os"
)

type Mail struct {
	To      string
	Subject string
	Message string
}

func SubmitMail(ctx *gin.Context, email Mail) int {

	message := mail.NewSingleEmail(
		mail.NewEmail(os.Getenv("APP_NAME"), os.Getenv("MAIL_FROM")),
		email.Subject,
		mail.NewEmail("", email.To),
		StripTags(email.Message),
		email.Message,
	)

	client := sendgrid.NewSendClient(os.Getenv("MAIL_API_KEY"))
	response, err := client.Send(message)

	if err != nil {
		return http.StatusServiceUnavailable
	} else {
		return response.StatusCode
	}
}
