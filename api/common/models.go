package common

import (
	"encoding/json"
	"time"
)

type User struct {
	ID             int
	Username       string
	FullName       string
	Email          string
	HashedPassword string
	Active         bool
	CreatedAt      time.Time
	Role           string
}

type Service struct {
	Name string
	Desc string
}
type Professional struct {
	FullName string
	Rating   int
	Services []Service
}

type PasswordChangeRequest struct {
	UserId   int
	CratedAt time.Time
	Token    string
}

func UsersModelLoader() (*[]User, func(rowBytes []byte)) {
	var users []User
	return &users, func(rowBytes []byte) {
		var user User
		_ = json.Unmarshal(rowBytes, &user)
		users = append(users, user)
	}
}

func ProfessionalsModelLoader() (*[]Professional, func(rowBytes []byte)) {
	var pros []Professional

	return &pros, func(rowBytes []byte) {
		var pro Professional
		_ = json.Unmarshal(rowBytes, &pro)
		pros = append(pros, pro)
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

func PasswordChangeRequestsModelLoader() (*[]PasswordChangeRequest, func(rowBytes []byte)) {
	var requests []PasswordChangeRequest
	return &requests, func(rowBytes []byte) {
		var req PasswordChangeRequest
		_ = json.Unmarshal(rowBytes, &req)
		requests = append(requests, req)
	}
}
