package send_service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"yokaid/api/common"
)

func getMailHTML(templateName string, data map[string]string) (string, error) {
	tmpl, err := template.ParseFiles("send_service/templates/mail_base.html", templateName)
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

func GetMailContactFormRequest(data map[string]string) (string, error) {
	return getMailHTML("send_service/templates/contact_form_request.html", data)
}

type MailContact struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Mail struct {
	Sender      MailContact   `json:"sender"`
	To          []MailContact `json:"to"`
	Subject     string        `json:"subject"`
	HtmlContent string        `json:"htmlContent"`
}

func SendMail(to string, htmlMessage string, subject string) error {

	payload, err := json.Marshal(map[string]any{
		"from":    map[string]any{"email": common.Config.AppMailFrom, "name": common.Config.AppName},
		"to":      []map[string]any{{"email": to}},
		"subject": subject,
		"html":    htmlMessage,
	})

	if err != nil {
		return err
	}
	return common.RequestJson(payload, common.Config.SendMail.Url,
		map[string]string{
			"Authorization": fmt.Sprintf("Bearer %s", common.Config.SendMail.Auth),
		})

}

//func createMIMEMailBytes(from string, to string, subject string, body string) []byte {
//
//	headers := textproto.MIMEHeader{}
//	headers.Set("From", from)
//	headers.Set("To", to)
//	headers.Set("Subject", subject)
//	headers.Set("MIME-Version", "1.0")
//	headers.Set("Content-Type", "text/html; charset=utf-8")
//
//	var msg = new(bytes.Buffer)
//
//	for key, value := range headers {
//		fmt.Fprintf(msg, "%s: %s\r\n", key, value)
//	}
//
//	msg.WriteString("\r\n")
//	msg.WriteString(body)
//
//	return msg.Bytes()
//}

//func SendMail(to string, htmlBody string, subject string) error {
//

//	smtpServer := "email-smtp.eu-north-1.amazonaws.com"
//	smtpPort := 465
//	serverAddr := fmt.Sprintf("%s:%d", smtpServer, smtpPort)
//
//	auth := smtp.PlainAuth("", "AKIA6N5ZRWLGOZZ4TBMF", "BOIzrfVPRfshe7r2poR4gJ9rMrNdhtM2PiKO2UOI3oFN", smtpServer)
//
//	err := smtp.SendMail(
//		serverAddr, auth, common.Config.AppMailFrom, []string{to},
//		createMIMEMailBytes(common.Config.AppMailFrom, to, subject, htmlBody))
//
//	if err != nil {
//		return err
//	}
//
//	return nil
//}
