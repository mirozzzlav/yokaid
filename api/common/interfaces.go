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
	SetAuthUser(u AuthUser)
	GetAuthUser() (AuthUser, error)
	IsPrivateRoute(path string) bool
	Start() error
	Close()
}

type StoreRequestGetter interface {
	GetStoreRequest() (StoreRequest, error)
}

type Store interface {
	GetAUser(username string) (User, error)
	ListPolicies() ([]Policy, error)
	ListPoliciesAsStringArray() ([][]string, error)
	ListProfessionals(reqGetters []StoreRequestGetter, fn func(rowBytes []byte)) error
	CreateRental(rental Rental) (Rental, error)
}
