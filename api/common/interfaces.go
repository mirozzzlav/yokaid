package common

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Server interface {
	GetQueriesRepo() QueriesRepo
	GetValidate() *validator.Validate
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
	GetProfessionalsCountQuery(filter QueryPartial) Query
	GetProfessionalsQuery(filter QueryPartial, lang string, limit int) Query
	GetProfessionalDetailQuery(professionalId, reviewsPage int, userId string, lang string) Query
	CreateProfessionalQuery(req CreateProfessionalRequest) Query
	CreateProfessionalProfessionsQuery(professionalId int, professionId []int) Query
	GetProfessionalContactQueryByPaymentIdQuery(paymentId string) Query
	CreateReviewQuery(paymentId string, professionalId int, req CreateReviewRequest) Query
	GetProfessionsQuery(filter QueryPartial, lang string) Query
	CreatePaymentQuery(id string, userId UserId, productId string, paymentState string) Query
	CheckUserReviewedPro(userId UserId, professionalId int) Query
	GetProfessionalContactQuery(professionalId int, userId UserId, columns ...string) Query
	CreateProfessionalContactQuery(paymentId string, req CreateUserProfessionalContactRequest) Query
	MakePaymentQuery(code string) Query
}

type StoreHelpers interface {
	HandleFilter(filter string) (QueryPartial, error)
	CreateReviewAndProfessional(paymentId string, req CreateReviewAndProfessionalRequest) (int, error)
	CreateProfessionalContactWithPayment(req CreateUserProfessionalContactRequest, paymentState string) (string, error)

	// only for testing
	Insert() int
	Update(id int)
	Delete(id int)
}
