package common

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Server interface {
	GetValidate() *validator.Validate
	Start() error
	GetAppService(ctx *gin.Context) AppService
}

type AppService interface {
	Begin() error
	Commit() error
	Rollback() error
	Professionals() ProfessionalService
	Contacts() ContactService
	Reviews() ReviewService
	Payments() PaymentService
	Professions() ProfessionService
}

type Store interface {
	Begin() error
	Commit() error
	Rollback() error
	Professionals() ProfessionalRepository
	Contacts() ContactRepository
	Reviews() ReviewRepository
	Payments() PaymentRepository
	Professions() ProfessionRepository
}

type ProfessionalRepository interface {
	ProfessionalExists(phone PhoneNumber, email *string) (bool, error)
	CreateProfessional(req CreateProfessionalRequest) (int, error)
	AddProfessionalProfessions(professionalId int, professionIds []int) error
	CreateReview(paymentId string, professionalId int, req CreateReviewRequest) error
	GetProfessionals(filter string, lang string) ([]Professional, error)
	SearchProfessionals(searchName string, lang string) ([]Professional, error)
	GetProfessionalDetail(professionalId int, reviewsPage int, userId string, lang string) (*Professional, error)
}

type ContactRepository interface {
	GetProfessionalContactPaymentId(req CreateUserProfessionalContactRequest) (string, error)
	HasUnlockedContact(professionalId int, userId UserId) (bool, error)
	GetUnlockedContactByPaymentId(paymentId string) ([]Contact, error)
	CreatePayment(id string, userId UserId, productId string, paymentState string) (string, error)
	CreateProfessionalContact(paymentId string, req CreateUserProfessionalContactRequest) error
}

type ReviewRepository interface {
	UserReviewedProfessional(userId UserId, professionalId int) (bool, error)
	CreateReview(paymentId string, professionalId int, req CreateReviewRequest) error
}

type PaymentRepository interface {
	CreatePayment(id string, userId UserId, productId string, paymentState string) (string, error)
	MakePayment(code string) error
}

type ProfessionRepository interface {
	GetProfessions(searchTitle string, lang string) ([]Profession, error)
	GetAllProfessions(lang string) ([]Profession, error)
}

type ProfessionalService interface {
	GetProfessionals(filter string, lang string) ([]Professional, error)
	SearchProfessionals(searchName string, lang string) ([]Professional, error)
	GetProfessionalDetail(professionalId int, reviewsPage int, userId string, lang string) (*Professional, error)
	CreateReviewAndProfessionalWithPayment(req CreateReviewAndProfessionalRequest, paymentState string) (string, int, error)
}

type ContactService interface {
	HasUnlockedContact(professionalId int, userId UserId) (bool, error)
	GetUnlockedContactByPaymentId(paymentId string) ([]Contact, error)
	CreateProfessionalContactWithPayment(req CreateUserProfessionalContactRequest, paymentState string) (string, error)
}

type ReviewService interface {
	CreateReviewForExistingProfessionalWithPayment(req CreateReviewForExistingProfessionalRequest, paymentState string, checkExistingReview bool) (string, error)
}

type PaymentService interface {
	MakePayment(code string) error
}

type ProfessionService interface {
	GetProfessions(searchTitle string, lang string) ([]Profession, error)
	GetAllProfessions(lang string) ([]Profession, error)
}
