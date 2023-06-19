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

type StoreQueryProcessor interface {
	GetQuery() (StoreQuery, error)
}

type QueryManager interface {
	SelectRows(q StoreQuery, fn func(rowBytes []byte)) error
	SelectRowsAsStringArray(q StoreQuery, fn func(rowBytes []byte)) error
	SelectRow(q StoreQuery, fn func(rowBytes []byte)) error
}

type Store interface {
	GetUser(q StoreQuery, fn func(rowBytes []byte)) error
	ListPolicies(fn func(rowBytes []byte)) error
	ListProfessionals(q StoreQuery, fn func(rowBytes []byte)) error
}
