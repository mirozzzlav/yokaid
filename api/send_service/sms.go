package send_service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"yokaid/api/common"
)

type SMSMessagePartial struct {
	To     string `json:"to"`
	Source string `json:"source"`
	Body   string `json:"body"`
}

type SMSMessage struct {
	Messages []SMSMessagePartial `json:"messages"`
}

func newMessagePartial(to string, message string) SMSMessagePartial {
	return SMSMessagePartial{
		To:     to,
		Source: common.Config.AppName,
		Body:   message,
	}
}

func SendSMS(to string, message string) error {

	payload, err := json.Marshal(
		SMSMessage{
			Messages: []SMSMessagePartial{
				newMessagePartial(to, message),
			},
		})
	if err != nil {
		return err
	}

	return common.RequestJson(payload, common.Config.SendSMS.Url,
		map[string]string{
			"Authorization": fmt.Sprintf(
				"BASIC %s", base64.StdEncoding.EncodeToString([]byte(common.Config.SendSMS.Auth)),
			),
		},
	)
}
