package common

import (
	"encoding/json"
	"time"
)

type User struct {
	ID                int
	Username          string
	Fullname          string
	Email             string
	HashedPassword    string
	PasswordChangedAt *time.Time
	CreatedAt         time.Time
	Role              string
}

type Service struct {
	Name string
	Desc string
}
type Professional struct {
	Fullname string
	Rating   int
	Services []Service
}

func UserModelLoader() (*User, func(rowBytes []byte)) {
	var user User
	return &user, func(rowBytes []byte) {
		_ = json.Unmarshal(rowBytes, &user)
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
