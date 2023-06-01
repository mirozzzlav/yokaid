package types

import (
	"database/sql"
	"time"
)

type Action struct {
	Name string
}

type Policy struct {
	ID       int
	Subject  string
	Action   string
	Resource string
}

type Role struct {
	Name string
}

type Service struct {
	Name string
	Desc string
}

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

type Professional struct {
	ID       int
	User     User
	Rating   int
	Services []Service
}

type ProfessionalsService struct {
	Professional Professional
	Service      Service
}

type Rental struct {
	ID           int
	RentedFrom   time.Time
	RentedTo     time.Time
	Status       string
	Professional Professional
	Renter       User
}
