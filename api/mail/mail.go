package mail

import (
	"bytes"
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"html/template"
	"rental-app/api/common"
)

type Mail struct {
	To      string
	Subject string
	Message string
}

func sendMail(email Mail) error {

	message := mail.NewSingleEmail(
		mail.NewEmail(common.Config.AppName, common.Config.AppMailFrom),
		email.Subject,
		mail.NewEmail("", email.To),
		common.StripTags(email.Message),
		email.Message,
	)

	client := sendgrid.NewSendClient(common.Config.AppMailAPIKey)
	_, err := client.Send(message)

	return err
}

type templateGetter func(data map[string]string) (string, error)

var templateGetters = map[string]templateGetter{
	"userActivation": func(data map[string]string) (string, error) {
		tmpl, err := template.ParseFiles("mail/mail_base.html", "mail/user_activate.html")
		if err != nil {
			return "", err
		}

		var buf bytes.Buffer
		err = tmpl.Execute(&buf, data)
		if err != nil {
			return "", err
		}

		return buf.String(), nil
	},
}

type Notifier struct{}

func (notifier Notifier) SendUserActivation(to string, data map[string]string) error {
	data["headline"] = "Activate your account"
	data["activationURL"] = fmt.Sprintf("%s/users/activate/%s", common.Config.Url, data["activationToken"])

	msg, err := templateGetters["userActivation"](data)
	if err != nil {
		return err

	}
	return sendMail(Mail{To: to, Subject: data["headline"], Message: msg})
}
