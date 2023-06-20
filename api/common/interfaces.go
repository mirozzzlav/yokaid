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
	GetTokenMaker() Maker
	GetQueryRunner() QueryRunner
	GetConfig() Config
	SetAuthUser(u AuthUser)
	GetAuthUser() (AuthUser, error)
	IsPrivateRoute(path string) bool
	Start() error
	Close()
}

type QueryRunner interface {
	GetRows(q Query, fn func(rowBytes []byte)) error
}
type QueryPartialProcessor interface {
	GetPartial() (QueryPartial, error)
}

type Query interface {
	GetQuery() (string, []any)
}
