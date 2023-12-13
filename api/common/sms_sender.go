package common

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
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
		Source: Config.AppName,
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

	req, err := http.NewRequest("POST", Config.SMSSend.ApiUrl, bytes.NewBuffer(payload))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(
		"Authorization",
		fmt.Sprintf(
			"BASIC %s", base64.StdEncoding.EncodeToString([]byte(Config.SMSSend.Auth)),
		),
	)

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	return nil
}
