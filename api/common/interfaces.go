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
	GetStoreHelpers() StoreHelpers
	SetAuthUser(u AuthUser)
	GetAuthUser() *AuthUser
	IsPrivateRoute(path string) bool
	GetValidate() *validator.Validate
	GetNotifier() Notifier
	Start() error
	Close()
}

type QueryRunner interface {
	GetScalar(q Query) (int, error)
	GetRows(q Query, fn func(rowBytes []byte)) error
	GetRowsAsArrayOfArrays(q Query, fn func(rowBytes []byte)) error
	Begin()
	Commit()
	Update(q Query) error
	Create(q Query, IdColumnName string) (any, error)
	Delete(q Query) error
}

type Query interface {
	GetQuery() (string, []any)
}

type QueriesRepo interface {
	GetUsersCountQuery(filter QueryPartial) Query
	UpdateUsersQuery(data QueryPartial, filter QueryPartial) Query
	ListPoliciesQuery() Query
	ListPostsQuery(filter QueryPartial) Query
	QueryUserTest(filter QueryPartial) Query
	DeletePasswordChangeRequestsQuery(filter QueryPartial) Query
}

type StoreHelpers interface {
	GenerateUserName(fullName string) (string, error)
	HandleFilter(filter string) (QueryPartial, error)
	ChangeUserPassword(userId int, pass string) error
	GetUserFromPasswordChangeRequest(token string) (int, error)
	CreatePasswordChangeRequest(userId int) (string, error)
	GetUsersCount(emailOrUsername string) (int, error)
	RegisterUser(req RegisterUserRequest) (string, error)
	GetUser(usernameOrEmail string) (*User, error)
	GetUserAndVerifyPassword(usernameOrEmail string, password string) (*User, error)
	CreatePost(authorId int, req CreatePostRequest) (int, error)

	// only for testing
	Insert() int
	Update(id int)
	Delete(id int)
}

type Notifier interface {
	SendNotification(to string, subject string, message string) error
	SendUserActivation(to string, data map[string]string) error
	SendPasswordChangeRequest(to string, data map[string]string) error
}
