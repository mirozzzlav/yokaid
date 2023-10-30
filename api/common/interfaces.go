package common

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Server interface {
	GetQueriesRepo() QueriesRepo
	GetValidate() *validator.Validate
	GetNotifier() Notifier
	Start() error
	GetQueryRunner(ctx *gin.Context) QueryRunner
	GetStoreHelpers(ctx *gin.Context) StoreHelpers
}

type QueryRunner interface {
	GetScalar(q Query) (any, error)
	GetRows(q Query, fn func(rowBytes []byte)) error
	Begin() error
	Commit() error
	Exec(q Query, idColumnNameParam ...string) (any, error)
	Rollback() error
}

type Query interface {
	GetQuery() (string, []any)
}

type QueriesRepo interface {
	GetUsersCountQuery(filter QueryPartial) Query
	UpdateUsersQuery(data QueryPartial, filter QueryPartial) Query
	ListPoliciesQuery() Query
	GetProfessionalsCountQuery(filter QueryPartial) Query
	GetProfessionalsQuery(filter QueryPartial, reviews bool, userId string) Query
	QueryUserTest(filter QueryPartial) Query
	DeletePasswordChangeRequestsQuery(filter QueryPartial) Query
	CreateProfessionalQuery(req CreateProfessionalRequest) Query
	CreateProfessionalProfessionsQuery(professionalId int, professionId []int) Query
	CreateReviewQuery(paymentId string, professionalId int, req CreateReviewRequest) Query
	GetProfessionsQuery(filter QueryPartial) Query
	CreatePaymentQuery(id string, userId string, productId string) Query
	GetProfessionalContactQuery(professionalId int, userId string, columns ...string) Query
	CreateProfessionalContactQuery(paymentId string, req CreateUserProfessionalContactRequest) Query
}

type StoreHelpers interface {
	GenerateUserName(fullName string) (string, error)
	HandleFilter(filter string) (QueryPartial, error)
	GetUserFromPasswordChangeRequest(token string) (int, error)
	CreatePasswordChangeRequest(userId int) (string, error)
	GetUsersCount(emailOrUsername string) (int, error)
	GetFilterItems(columnAliases []string, searchedItem string, limit int) (*[]FilterItem, error)
	GetProfessionalProfessionsForFilter() (*[]FilterItem, error)
	CreateReviewAndProfessional(paymentId string, req CreateReviewAndProfessionalRequest) (int, error)

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
