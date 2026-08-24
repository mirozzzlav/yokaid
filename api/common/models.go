package common

import (
	"encoding/json"
	"time"
)

type PhoneNumber string

func (phoneNumberIn *PhoneNumber) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		return nil
	}
	var num string
	json.Unmarshal(b, &num)
	*phoneNumberIn = PhoneNumber(GetNumberSanitized(num))
	return nil
}

type UserId string

func (userIdIn *UserId) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		return nil
	}
	var num string
	json.Unmarshal(b, &num)
	*userIdIn = UserId(GetNumberSanitized(num))
	return nil
}

type timeCustom struct {
	time.Time
}

func (t *timeCustom) UnmarshalJSON(b []byte) error {

	if string(b) == "null" {
		return nil
	}
	tRes, err := time.Parse("\"2006-01-02T15:04:05.999999Z\"", string(b))
	if err != nil {
		return err
	}
	t.Time = tRes
	return nil
}

type Contact struct {
	Phone string `json:"phone"`
	Email string `json:"email"`
}

func (contactIn *Contact) UnmarshalJSON(b []byte) error {

	var c map[string]any
	if string(b) == "null" {
		return nil
	}
	json.Unmarshal(b, &c)
	if c["email"] == nil {
		(*contactIn).Email = ""
	} else {
		(*contactIn).Email = c["email"].(string)
	}
	(*contactIn).Phone = GetPhoneNumber(c["phone"].(string))

	return nil
}

type Professional struct {
	ID           int          `json:"id"`
	FullName     string       `json:"fullName"`
	Rating       int          `json:"rating"`
	BusinessId   string       `json:"businessId"`
	Location     string       `json:"location"`
	LocationLat  float64      `json:"locationLat"`
	LocationLng  float64      `json:"locationLng"`
	Professions  []Profession `json:"professions"`
	Reviews      []Review     `json:"reviews"`
	ReviewsCount int          `json:"reviewsCount"`
	Contact      *Contact     `json:"contact"`
}

type Review struct {
	Id            string    `json:"id"`
	Text          string    `json:"text"`
	Rating        int       `json:"rating"`
	Images        *[]string `json:"images"`
	MediaFolderId *string   `json:"mediaFolderId"`
	//CreatedAt timeCustom   `json:"createdAt"`
}
type Profession struct {
	Id    int    `json:"id"`
	Title string `json:"title"`
}
