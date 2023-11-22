package mail

import (
	"bytes"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"html/template"
	"log"
	"some-app/api/common"
)

type templateGetter func(data map[string]string) (string, error)

func getMailHTML(partialContentFileName string, data map[string]string) (string, error) {
	tmpl, err := template.ParseFiles("mail/mail_base.html", partialContentFileName)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, data)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

var templateGetters = map[string]templateGetter{
	"userActivation": func(data map[string]string) (string, error) {
		return getMailHTML("mail/user_activate.html", data)
	},
	"userPasswordChange": func(data map[string]string) (string, error) {
		return getMailHTML("mail/user_pass_change.html", data)
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
