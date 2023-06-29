package mail

import (
	"bytes"
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"html/template"
	"log"
	"rental-app/api/common"
)

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

func (notifier Notifier) SendNotification(to string, subject string, message string) error {

	if !common.Config.EnableNotifications {
		log.Println("--- APP Notifications are disabled ---")
		return nil
	}

	_mail := mail.NewSingleEmail(
		mail.NewEmail(common.Config.AppName, common.Config.AppMailFrom),
		subject,
		mail.NewEmail("", to),
		common.StripTags(message),
		message,
	)

	client := sendgrid.NewSendClient(common.Config.AppMailAPIKey)
	_, err := client.Send(_mail)

	return err
}

func (notifier Notifier) SendUserActivation(to string, data map[string]string) error {
	data["headline"] = "Activate your account"
	data["activationURL"] = fmt.Sprintf("%s/users/activate/%s", common.Config.Url, data["activationToken"])

	msg, err := templateGetters["userActivation"](data)
	if err != nil {
		return err

	}
	return notifier.SendNotification(to, data["headline"], msg)
}
