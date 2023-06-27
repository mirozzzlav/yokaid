package common

import (
	"github.com/go-playground/validator/v10"
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
	GetQueriesRepo() QueriesRepo
	GetConfig() Config
	SetAuthUser(u AuthUser)
	GetAuthUser() *AuthUser
	IsPrivateRoute(path string) bool
	GetValidate() *validator.Validate
	Start() error
	Close()
}

type QueryRunner interface {
	GetScalar(q Query) (int, error)
	GetRows(q Query, fn func(rowBytes []byte)) error
	GetRowsAsArrayOfArrays(q Query, fn func(rowBytes []byte)) error
	Update(q Query) error
	Create(q Query, IdColumnName string) (int, error)
	Delete(q Query) error
}

type Query interface {
	GetQuery() (string, []any)
}

type QueriesRepo interface {
	GetUsersQuery(filter QueryPartial) Query
	GetUsersCountQuery(filter QueryPartial) Query
	UpdateUsersQuery(data QueryPartial, filter QueryPartial) Query
	CreateUserQuery(data QueryPartial) Query
	ListPoliciesQuery() Query
	ListProfessionalsQuery(filter QueryPartial) Query
	QueryUserTest(filter QueryPartial) Query
	CreatePasswordChangeRequestQuery(data QueryPartial) Query
	GetPasswordChangeRequestsQuery(data QueryPartial) Query
	DeletePasswordChangeRequestsQuery(filter QueryPartial) Query
}
