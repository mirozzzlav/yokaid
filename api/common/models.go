package common

import (
	"encoding/json"
	"time"
)

type imagePath string

func (i *imagePath) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		return nil
	}
	var path string
	json.Unmarshal(b, &path)
	*i = imagePath(Config.AssetsRelativeUrl + "/" + path)
	return nil
}

type PhoneNumber string

func (phoneNumberIn *PhoneNumber) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		return nil
	}
	var num string
	json.Unmarshal(b, &num)
	*phoneNumberIn = PhoneNumber(getNumberSanitized(num))
	return nil
}

type UserId string

func (userIdIn *UserId) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		return nil
	}
	var num string
	json.Unmarshal(b, &num)
	*userIdIn = UserId(getNumberSanitized(num))
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

type contact struct {
	Phone string `json:"phone"`
	Email string `json:"email"`
}

func (contactIn *contact) UnmarshalJSON(b []byte) error {

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

type professional struct {
	ID           int          `json:"id"`
	FullName     string       `json:"fullName"`
	Rating       int          `json:"rating"`
	BusinessId   string       `json:"businessId"`
	Location     string       `json:"location"`
	LocationLat  float64      `json:"locationLat"`
	LocationLng  float64      `json:"locationLng"`
	Professions  []profession `json:"professions"`
	Reviews      []review     `json:"reviews"`
	ReviewsCount int          `json:"reviewsCount"`
	Contact      *contact     `json:"contact"`
}

type review struct {
	Id     string       `json:"id"`
	Text   string       `json:"text"`
	Rating int          `json:"rating"`
	Images *[]imagePath `json:"images"`
	//CreatedAt timeCustom   `json:"createdAt"`
}
type profession struct {
	Id    int    `json:"id"`
	Title string `json:"title"`
}

type ListItem struct {
	FilterColumnAlias string `json:"filterColumnAlias"`
	Value             any    `json:"value"`
	Label             string `json:"label"`
}

func ListItemLoader() (*[]ListItem, func(rowBytes []byte)) {
	var listItems []ListItem
	return &listItems, func(rowBytes []byte) {
		var listItem ListItem
		_ = json.Unmarshal(rowBytes, &listItem)
		listItems = append(listItems, listItem)
	}
}

func ProfessionalsModelLoader() (*[]professional, func(rowBytes []byte)) {
	var professionals []professional

	return &professionals, func(rowBytes []byte) {
		var pro professional
		_ = json.Unmarshal(rowBytes, &pro)
		professionals = append(professionals, pro)
	}
}

func ProfessionsModelLoader() (*[]profession, func(rowBytes []byte)) {
	var professions []profession
	return &professions, func(rowBytes []byte) {
		var profession profession
		_ = json.Unmarshal(rowBytes, &profession)
		professions = append(professions, profession)
	}
}

func ContactsModelLoader() (*[]contact, func(rowBytes []byte)) {
	var contacts []contact
	return &contacts, func(rowBytes []byte) {
		var req contact
		_ = json.Unmarshal(rowBytes, &req)
		contacts = append(contacts, req)
	}
}
