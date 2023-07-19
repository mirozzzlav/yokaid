package common

import (
	"encoding/json"
	"time"
)

type timeCustom struct {
	time.Time
}

func (t *timeCustom) UnmarshalJSON(b []byte) error {

	tRes, err := time.Parse("\"2006-01-02T15:04:05.999999Z\"", string(b))
	if err != nil {
		return err
	}
	t.Time = tRes
	return nil
}

type User struct {
	ID             int
	Username       string
	FullName       string
	Email          string
	HashedPassword string
	Active         bool
	CreatedAt      timeCustom
	Role           string
}

type post struct {
	Id        int
	Author    string
	Latitude  float64
	Longitude float64
	Text      string
	CreatedAt timeCustom
	Headline  string
}

type passwordChangeRequest struct {
	UserId    int
	CreatedAt timeCustom
	Token     string
}

func UsersModelLoader() (*[]User, func(rowBytes []byte)) {
	var users []User
	return &users, func(rowBytes []byte) {
		var user User
		_ = json.Unmarshal(rowBytes, &user)
		users = append(users, user)
	}
}

func PostsModelLoader() (*[]post, func(rowBytes []byte)) {
	var posts []post

	return &posts, func(rowBytes []byte) {
		var post post
		_ = json.Unmarshal(rowBytes, &post)
		posts = append(posts, post)
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
