package common

import (
	"database/sql"
	"encoding/json"
	"time"
)

type User struct {
	ID                int
	Username          string
	Fullname          string
	Email             string
	HashedPassword    string
	PasswordChangedAt sql.NullTime
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

func UserFiller() (*User, func(rowBytes []byte)) {
	var user User
	return &user, func(rowBytes []byte) {
		_ = json.Unmarshal(rowBytes, &user)
	}
}

func ProfessionalsFiller() (*[]Professional, func(rowBytes []byte)) {
	var pros []Professional

	return &pros, func(rowBytes []byte) {
		var pro Professional
		_ = json.Unmarshal(rowBytes, &pro)
		pros = append(pros, pro)
	}
}

func PoliciesFiller() (*[][]string, func(rowBytes []byte)) {
	var policies [][]string
	return &policies, func(rowBytes []byte) {
		var mapObject map[string]any
		_ = json.Unmarshal(rowBytes, &mapObject)
		var policyRow []string
		for _, value := range mapObject {
			policyRow = append(policyRow, value.(string))
		}
		policies = append(policies, policyRow)
	}
}
