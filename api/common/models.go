package common

import (
	"database/sql"
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
