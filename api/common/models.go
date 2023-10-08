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
	*i = imagePath(Config.Url + Config.AssetsRelativeUrl + "/" + path)
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

type User struct {
	ID             int    `json:"id"`
	Username       string `json:"username"`
	FullName       string `json:"fullName"`
	Email          string `json:"email"`
	HashedPassword string
	Active         bool
	CreatedAt      timeCustom `json:"createdAt"`
	Role           string
}

type professional struct {
	ID           int          `json:"id"`
	FullName     string       `json:"fullName"`
	Phone        string       `json:"phone"`
	Email        string       `json:"email"`
	Rating       int          `json:"rating"`
	BusinessId   string       `json:"businessId"`
	Location     string       `json:"location"`
	LocationLat  float64      `json:"locationLat"`
	LocationLng  float64      `json:"locationLng"`
	Professions  []profession `json:"professions"`
	Reviews      []review     `json:"reviews"`
	ReviewsCount int          `json:"reviewsCount"`
}

type review struct {
	Id     int          `json:"id"`
	Text   string       `json:"text"`
	Rating int          `json:"rating"`
	Images *[]imagePath `json:"images"`
	//CreatedAt timeCustom   `json:"createdAt"`
}
type profession struct {
	Id    int    `json:"id"`
	Title string `json:"title"`
}

type passwordChangeRequest struct {
	UserId    int
	CreatedAt timeCustom
	Token     string
}

type FilterItem struct {
	FilterColumnAlias string `json:"filterColumnAlias"`
	Value             any    `json:"value"`
	Label             string `json:"label"`
}

func FilterItemLoader() (*[]FilterItem, func(rowBytes []byte)) {
	var filterItems []FilterItem
	return &filterItems, func(rowBytes []byte) {
		var filterItem FilterItem
		_ = json.Unmarshal(rowBytes, &filterItem)
		filterItems = append(filterItems, filterItem)
	}
}

func UsersModelLoader() (*[]User, func(rowBytes []byte)) {
	var users []User
	return &users, func(rowBytes []byte) {
		var user User
		_ = json.Unmarshal(rowBytes, &user)
		users = append(users, user)
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

func PoliciesModelLoader() (*[][]string, func(rowBytes []byte)) {
	var policies [][]string

	return &policies, func(rowBytes []byte) {
		var policy []string
		_ = json.Unmarshal(rowBytes, &policy)

		policies = append(policies, policy)

	}
}

func PasswordChangeRequestsModelLoader() (*[]passwordChangeRequest, func(rowBytes []byte)) {
	var requests []passwordChangeRequest
	return &requests, func(rowBytes []byte) {
		var req passwordChangeRequest
		_ = json.Unmarshal(rowBytes, &req)
		requests = append(requests, req)
	}
}
