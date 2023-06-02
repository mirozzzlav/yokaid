package common

import (
	"time"
)

type Maker interface {
	CreateToken(user AuthUser) (string, error)
	VerifyToken(token string, tokenDuration time.Duration) (*AuthPayload, error)
	ParseToken(token string) (*AuthPayload, error)
}

type Server interface {
	GetStore() Store
	GetTokenMaker() Maker
	GetConfig() Config
}

type Store interface {
	GetAUser(username string) (User, error)
	ListPolicies() ([]Policy, error)
	ListPoliciesAsStringArray() ([][]string, error)
	ListProfessionals(filter string) ([]Professional, error)
}
